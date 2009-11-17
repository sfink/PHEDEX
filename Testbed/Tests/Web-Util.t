#!/usr/bin/env perl
use warnings;
use strict;
$|++;

use Test::More;

BEGIN { use_ok( 'PHEDEX::Web::Util' ); }
require_ok( 'PHEDEX::Web::Util' );

# returns 1 if passed subref and args die, 0 otherwise
sub dies {
    my $subref = shift;
    eval { $subref->(@_); };
    return $@ ? 1 : 0;
}
sub lives {  return !dies(@_); }

sub whydie { diag("died because: $@"); }

# test the test functions
ok( dies(sub { die "dying"; }),                                                  'test dies');
ok( lives(sub { return "I'm alive!" }),                                          'test lives');

# tests for developers who didn't read the docs
ok( dies(\&valiate_params),                                                      'no arguments');
ok( dies(\&valiate_params, {}),                                                  'no specification');
ok( dies(\&valiate_params, {}, fullof => 'crap'),                                'junk specification');
ok( dies(\&validate_params, {}, allow => []),                                    'nothing allowed');

# basic checking - good params
ok( lives(\&validate_params, {}, allow => ['foo']),                              'zero of one allowed') or whydie;
ok( lives(\&validate_params, { foo => 1 }, allow => ['foo']),                    'one of one allowed') or whydie;
ok( lives(\&validate_params, {}, allow => [qw(foo bar)]),                        'zero of two allowed') or whydie;
ok( lives(\&validate_params, { foo => 1  }, allow => [qw(foo bar)]),             'one of two allowed') or whydie;
ok( lives(\&validate_params, { foo => 1, bar => 1 }, allow => [qw(foo bar)]),    'two of two allowed') or whydie;
ok( lives(\&validate_params, { foo => 1 }, required => ['foo']),                 'one of one required') or whydie;
ok( lives(\&validate_params, { foo => 1, bar => 1 }, required => [qw(foo bar)]), 'two of two required') or whydie;
ok( lives(\&validate_params, { foo => 1, bar => 1, baz => 1 }, 
	  allow => [qw(foo bar baz)], required => [qw(foo bar)]),                'required plus one') or whydie;
ok( lives(\&validate_params, { foo => 1 }, 
	  require_one_of => [qw(foo bar)]),                                      'one of two options') or whydie;
ok( lives(\&validate_params, { foo => 1, bar => 1 }, 
	  require_one_of => [qw(foo bar)]),                                      'two of two options') or whydie;
ok( lives(\&validate_params, { foo => 1, baz => 1 }, 
	  allow => [qw(foo bar baz)], require_one_of => [qw(foo bar)]),          'option plus one') or whydie;

# basic checking - bad params
ok( dies (\&validate_params, { foo => undef }, allow => ['foo']),                'undef param');
ok( dies (\&validate_params, { foo => '' }, allow => ['foo']),                   'empty string param');
ok( dies (\&validate_params, { foo => {} }, allow => ['foo']),                   'bad type param');
ok( dies (\&validate_params, { bar => 1 }, allow => ['foo']),                    'unknown param');
ok( dies (\&validate_params, { foo => [qw(one two)] }),                          'no arrays');
ok( dies (\&validate_params, {},           required => [qw(foo)]),               'missing requirement 1');
ok( dies (\&validate_params, { foo => 1 }, required => [qw(foo bar)]),           'missing requirement 2');
ok( dies (\&validate_params, { foo => 1 }, 
	  allow => [qw(foo bar)],  required => [qw(bar)]),                       'missing requirement 3');
ok( dies (\&validate_params, {},
	  allow => [qw(foo bar)],  required_one_of => [qw(bar baz)]),            'missing option 1');
ok( dies (\&validate_params, { foo => 1 },
	  allow => [qw(foo bar)],  required_one_of => [qw(bar baz)]),            'missing option 2');

# spec checking
my $optional_spec = { foo => { optional => 0 }};
ok( lives(\&validate_params, { foo => 1},  spec => $optional_spec),              'good optional override') or whydie;
ok( dies (\&validate_params, { },  spec => $optional_spec),                      'bad optional override');

my $type_spec = { foo => { type => Params::Validate::HASHREF } };
ok( lives(\&validate_params, { foo => {} }, spec => $type_spec),                 'good type override') or whydie;
ok( dies (\&validate_params, { foo => [] }, spec => $type_spec),                 'bad type override');

my $regex_spec = { foo => { regex => qr/foo/ } };
ok( lives(\&validate_params, { foo => 'foo' }, spec => $regex_spec),             'good regex override') or whydie;
ok( dies (\&validate_params, { foo => 'bar' }, spec => $regex_spec),             'bad regex override');

my $callback_spec = {
    foo => { 
	callbacks => { 'TheOne' => sub { return $_[0] eq 'one' } }
    } 
};
ok( lives(\&validate_params, { foo => 'one' }, spec => $callback_spec),          'good callback') or whydie;
ok( dies (\&validate_params, { foo => 'two' }, spec => $callback_spec),          'bad callback');

# multiple-value checking
my $multiple_spec = { foo => { multiple => 1 } };
ok( lives(\&validate_params, { foo => 'one' }, spec => $multiple_spec),          'good multiple: single') or whydie;
ok( lives(\&validate_params, { foo => [qw(one two)] },  spec => $multiple_spec), 'good multiple: multiple') or whydie;
ok( dies (\&validate_params, { foo => ['one', undef] }, spec => $multiple_spec), 'bad multiple: undef');
ok( dies (\&validate_params, { foo => ['one', ''] }, spec => $multiple_spec),    'bad multiple: empty string');
ok( dies (\&validate_params, { foo => ['one', {}] }, spec => $multiple_spec),    'bad multiple: type');

my $multiple_regex = { foo => { multiple => 1, regex => qr/one/ } };
ok( lives(\&validate_params, { foo => 'one' }, spec => $multiple_regex),           'good multiple: re x 1') or whydie;
ok( dies (\&validate_params, { foo => 'two' }, spec => $multiple_regex),           'bad multiple: re x 1') or whydie;
ok( lives(\&validate_params, { foo => [qw(one onety)] }, spec => $multiple_regex), 'good multiple: re x 2') or whydie;
ok( dies (\&validate_params, { foo => [qw(one two)] },  spec => $multiple_regex),  'bad multiple: re x 2') or whydie;

done_testing();
