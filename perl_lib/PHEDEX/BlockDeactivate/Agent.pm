package PHEDEX::BlockDeactivate::Agent;

=head1 NAME

PHEDEX::BlockDeactivate::Agent - the Block Deactivation agent.

=head1 SYNOPSIS

pending...

=head1 DESCRIPTION

pending...

=head1 SEE ALSO...

L<PHEDEX::Core::Agent|PHEDEX::Core::Agent> 

=cut

use strict;
use warnings;
use base 'PHEDEX::Core::Agent';
use PHEDEX::Core::Logging;
use PHEDEX::Core::Timing;
use PHEDEX::Core::DB;

our %params =
	(
	  DBCONFIG => undef,		# Database configuration file
	  MYNODE => undef,		# My TMDB node
	  WAITTIME => 600 + rand(100),	# Agent cycle period
	  HOLDOFF => 3*86400,           # Hold-off time for pruning
	);

sub new
{
  my $proto = shift;
  my $class = ref($proto) || $proto;

  my $self = $class->SUPER::new(@_);
  foreach ( keys %params )
  {
    $self->{$_} = $params{$_} unless defined $self->{$_};
  }

  bless $self, $class;
  return $self;
}

# Run the main loop of this agent.
sub idle
{
    my ($self, @pending) = @_;
    my $dbh = undef;
    eval
    {
	$dbh = &connectToDatabase ($self);

	# Deactivate complete blocks.  Get all blocks whose all replicas
	# are complete and active.  First of all, ignore blocks where
	# replicas are already inactive.  Secondly, ignore all blocks
	# which have been touched "recently" to allow things to settle.
	#
	# Consider remaining (active) block replicas.  If all replicas
	# of a block have as many files as the block has, deactive the
	# block (and all replicas).  We also require for extra safety
	# that there can be no files in transfer, or export, and the
	# block is not scheduled for deletion
	#
	# We do *not* require that dest_files = node_files, as at file
	# source nodes dest_files is usually zero, and we still want
	# to deactivate.  This should be safe -- we deactivate a block
	# on intermediate node is if a) the entire block has already
	# reached all current destination nodes, b) either all or none
	# of the files have been removed in intermediate nodes, and
	# c) several days has passed like this.  It is unlikely that
	# all these criteria will be met simultaneously, and in any
	# case the fix is easy: reactivate the block.
	#
	# Process just one block each time to avoid overloading undo
	# segments unncessarily.  We can always deactive more later.
	#
	# What we do here requires a great degree of transactinal
	# consistency.  For one, we don't want someone to open blocks
	# while we are deactiving them; this is prevented by locking
	# the t_dps_block row with "select .. for update" while operating
	# on it, a convention followed by all programs which modify
	# block table.  Secondly, we need to make sure we delete the
	# exact number of file replicas we expected to delete; if an
	# inconsitency is detected, we roll back the transcation.
	my $qblocks = &dbexec ($dbh, qq{
	    select b.id, b.name
	    from t_dps_block b
	    where b.is_open = 'n'
	      and b.time_create < :limit
      	      and exists (select 1 from t_dps_block_replica br
      		          where br.block = b.id)
	      and (b.files, b.bytes, 0, 1, 'y') = all
      	          (select br.node_files, br.node_bytes, br.xfer_files,
		  	  sign(:limit - br.time_update), br.is_active
		   from t_dps_block_replica br
		   where br.block = b.id)
	      and not exists (select 1 from t_dps_block_delete bd
                               where bd.block = b.id
                                 and bd.time_complete is not null)
	    order by b.files desc
	    for update of b.id},
	    ":limit" => &mytimeofday () - $$self{HOLDOFF});
        if (my ($id, $name) = $qblocks->fetchrow())
	{
	    # Get the number of file replicas expected to delete.
	    my ($nfr) = &dbexec ($dbh, qq{
		select sum(node_files)
		from t_dps_block_replica
		where block = :block},
		":block" => $id)
		->fetchrow();
	    if (! $nfr)
	    {
		&alert ("refusing to deactivate block $name with no files");
		&dbexec ($dbh, qq{
		    update t_dps_block set is_open = 'y'
		    where id = :block},
		    ":block" => $id);
		$dbh->commit();
		return 0;
	    }

	    # Deactivate.
	    my ($dr, $nr) = &dbexec ($dbh, qq{
		delete from t_xfer_replica where fileid in
		(select id from t_xfer_file where inblock = :block)},
		":block" => $id);
	    &dbexec ($dbh, qq{
		delete from t_xfer_file where inblock = :block},
		     ":block" => $id);
	    
	    if ($nr != $nfr)
	    {
		&alert ("deactivating $name deleted $nr file replicas,"
			. " expected to delete $nfr, undoing deactivation");
		$dbh->rollback ();
	    }
	    else
	    {
	        my ($db, $nb) = &dbexec ($dbh, qq{
		    update t_dps_block_replica
		    set is_active = 'n'
		    where block = :block},
		    ":block" => $id);
	        &logmsg ("deactivated $name: $nr file replicas, $nb block replicas");
	        $dbh->commit ();
	    }
        }
    };
    do { chomp ($@); &alert ("database error: $@");
	 eval { $dbh->rollback() } if $dbh } if $@;

    # Disconnect from the database
    &disconnectFromDatabase ($self, $dbh);

    # Have a little nap
    $self->nap ($$self{WAITTIME});
}

sub isInvalid
{
  my $self = shift;
  my $errors = $self->SUPER::isInvalid
                (
                  REQUIRED => [ qw / MYNODE DROPDIR DBCONFIG / ],
                );
  return $errors;
}

1;
