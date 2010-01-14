/* PHEDEX.Navigator
 * Navigation widget for the application.  Allows user to input PhEDEx
 * entities ("Targets") and view widgets ("Pages") associated with them.
 * Uses PHEDEX.Core.Widget.Registry to build menus and construct
 * widgets.  Also defines the "Global Filter", which allows the user to
 * type in name:value pairs which are passed to the active widget to
 * apply filters.
*/
PHEDEX.namespace('Navigator');
PHEDEX.Navigator = function(sandbox) {
  this.id = 'Navigator_' + PxU.Sequence();
  var _sbx = sandbox,
      PxD  = PHEDEX.Datasvc,

    //========================= Private Properties ======================
      _hist_sym_sep = "+",    //This character separates the states in the history URL
      _hist_sym_equal = "~",  //This character indicates the state value
      _initialPageState,
      _targetPageState,
      me = 'navigator';

  YAHOO.lang.augmentObject(this, new PHEDEX.Base.Object());
  this.state = {}; // plugins from decorators to access state-information easily (cheating a little)

    //========================= Private Methods =========================
//     var _initGlobalFilter = function(el) {
//         PHEDEX.Event.CreateGlobalFilter.fire(el);
//     };

    /**
    * @method _initPermaLink
    * @description This creates the permalink element and defines function to set the permalink URL.
    * @param {Object} el Object specifying the element in the HTML page to be used for permalink.
    */

    /**
    * @method _getWidget
    * @description This gets the widget given the state and widget name.
    * @param {Object} state Object specifying the state of the page to be set.
    */
//     var _getWidget = function(state) {
// debugger;
//         var indx = 0;
//         var menu_items = _getWidgetMenuItems(state.type);
//         for (indx = 0; indx < menu_items.length; indx++) {
//             if (menu_items[indx].value.widget == state.widget) {
//                 return menu_items[indx].value;
//             }
//         }
//         return null;
//     };

    /**
    * @method _setState
    * @description This sets the state of the navigator. If the state has changed, fire _fireNavChange event.  
    * The changes to navigator state must pass through this function! It is also called by history navigate functionality 
    * to set the status in web page.
    * @param {String} pgstate String specifying the state of the page to be set.
    */
    _setState = function(obj) {
      return function(pgstate) {
        var state = null,
            changed = 0,
            value;
        if (!pgstate) {
            pgstate = _initialPageState; //Set the state to its initial state
        }
        if (pgstate) {
            state = _parseQueryString(pgstate); //Parse the current history state and get the key and its values
//             if (state.widget) {
//                 state.widget = _getWidget(state); //Get the widget given the widget name
//             }
        }
        if (!state) { return; } //Do Nothing and return
        for (var key in obj.state)
        {
          if ( !obj.state[key].isValid() ) { changed++; continue; }
          value = obj.state[key].state();
          if ( value != state[key] ) {
            log('setState: '+key+' ('+state[key]+' => '+value+')','info',this.me);
            changed++;
          }
        }
        log('setState: '+changed+' changes w.r.t. currently known state','info',this.me);
        if ( !changed ) { return; }
        _targetPageState = state;
        _sbx.notify(obj.id,'StateChanged',state);
      };
    }(this);

    /**
    * @method _setWidgetState
    * @description This sets the state of the widget after it has been constucted. The widget states are   
    * visible columns and sorted column 
    * @param {Object} wdgtstate Object specifying the state of the widget to be set.
    */
//     var _setWidgetState = function() {
// debugger;
//         var indx = 0;
//         var hiddencolumns = {};
//         if (_cur_widget_state && _cur_widget_obj.dataTable) {
//             if (_cur_widget_state.hiddencolumns) {
//                 var arrCols = _cur_widget_state.hiddencolumns.split("^");
//                 for (indx = 0; indx < arrCols.length; indx++) {
//                     if (arrCols[indx]) {
//                         hiddencolumns[arrCols[indx]] = 1;
//                     }
//                 }
//             }
//             var dtColumnSet = _cur_widget_obj.dataTable.getColumnSet();
//             var defnColumns = dtColumnSet.getDefinitions();
//             for (indx = 0; indx < defnColumns.length; indx++) {
//                 if (hiddencolumns[defnColumns[indx].key]) {
//                     if (!defnColumns[indx].hidden) {
//                         var objColumn = _cur_widget_obj.dataTable.getColumn(defnColumns[indx].key); //Get the object of column
//                         if (objColumn) {
//                             _cur_widget_obj.dataTable.hideColumn(objColumn);
//                         }
//                     }
// 
//                 }
//                 else if (defnColumns[indx].hidden) {
//                     var objColumn = _cur_widget_obj.dataTable.getColumn(defnColumns[indx].key); //Get the object of column
//                     if (objColumn) {
//                         _cur_widget_obj.dataTable.showColumn(objColumn);
//                         _cur_widget_obj.removeBtnMenuItem(defnColumns[indx].key);
//                     }
//                 }
//             }
//         }
//         if (_cur_widget_state && _cur_widget_obj.dataTable && _cur_widget_state.sortcolumn) {
//             var objColumn = _cur_widget_obj.dataTable.getColumn(_cur_widget_state.sortcolumn); //Get the object of column
//             if (objColumn) {
//                 _cur_widget_obj.dataTable.sortColumn(objColumn); //Sort in ascending order
//                 if (_cur_widget_state.sortdir.toLowerCase() == 'desc') {
//                     _cur_widget_obj.dataTable.sortColumn(objColumn); //Sort again if descending order is the direction
//                 }
//             }
//         }
//         _cur_widget_state = null; //Reset the widget state object
//     }

    /**
    * @method _parseQueryString
    * @description This parses the page query and return the key and its values.  
    * @param {String} strQuery specifies the state of the page to be set.
    */
    var _parseQueryString = function(strQuery) {
        var strTemp = "", indx = 0,
            arrResult = {},
            arrQueries = strQuery.split(_hist_sym_sep);
        for (indx = 0; indx < arrQueries.length; indx++) {
            strTemp = arrQueries[indx].split(_hist_sym_equal);
            if (strTemp[1].length > 0) {
                arrResult[strTemp[0]] = strTemp[1];
            }
        }
        return arrResult;
    };

    _initialPageState = YAHOO.util.History.getBookmarkedState("page") ||
                        YAHOO.util.History.getQueryStringParameter("page") ||
                        'instance~Production+type~none+widget~nodes';
    YAHOO.util.History.register("page", _initialPageState, _setState);

    /**
    * @method _getCurrentState
    * @description This gets the current state of the web page for history maintenance.  
    */
    this._getCurrentState = function() {
      var newState = '';
      for (var key in this.state)
      {
        if ( !this.state[key].isValid() ) { return null; }
        var value = this.state[key].state();
        if ( !value ) { log('State: key='+key+' got '+value,'warn',this.me); continue; }
        if ( newState ) { newState += _hist_sym_sep; }
        newState += key + _hist_sym_equal + value;
      }
      return newState;
    }

    /**
    * @method _addToHistory
    * @description This adds the current state of the web page to history for further navigation.
    */
    this._addToHistory = function() {
        var newState, currentState;
        try {
            newState = this._getCurrentState();
            if ( !newState ) { return; }
            currentState = YAHOO.util.History.getCurrentState("page");
            if (newState !== currentState) //Check if previous and current state are different to avoid looping
            {
                log('addToHistory: '+newState,'info',this.me);
                YAHOO.util.History.navigate("page", newState); //Add current state to history and set values
                _sbx.notify(this.id,'UpdatePermalink',newState);
            } else {
                log('addToHistory: state unchanged','info',this.me);
            }
        }
        catch (ex) {
          banner('Error determining page state','error');
          log(ex,'error',this.me);
          _setState(newState); //In case YUI History doesnt work
        }
    };

    /**
    * @method _formPermalinkURL
    * @description This gets the datatable state and is used to update the permalink
    */
//     var _formPermalinkURL = function() {
// debugger;
//         var baseURL = document.location.href;
//         var hashindx = baseURL.indexOf('#');
//         if (hashindx > -1) {
//             baseURL = baseURL.substring(0, hashindx);
//         }
//         var currentState = YAHOO.util.History.getCurrentState("page"); //Get the current state
//         currentState = currentState;
//         if (!currentState) {
//             currentState = _defaultPageState;
//         }
//         else {
//             var state = _parseQueryString(currentState); //Parse the current history state and get the key and its values
//             if (!state.target) {
//                 state.target = '';
//             }
//             if (!state.filter) {
//                 state.filter = '';
//             }
//             currentState = 'instance' + _hist_sym_equal + state.instance + _hist_sym_sep + 'type' + _hist_sym_equal + state.type + _hist_sym_sep +
//                            'target' + _hist_sym_equal + state.target + _hist_sym_sep + 'widget' + _hist_sym_equal + state.widget + _hist_sym_sep +
//                            'filter' + _hist_sym_equal + state.filter; //Form the query string
//         }
//         baseURL = '#page=' + currentState;
// 
//         var dtColumnSet = _cur_widget_obj.dataTable.getColumnSet();
//         var defnColumns = dtColumnSet.getDefinitions();
//         var indx = 0;
//         var wdgtState = _hist_sym_sep + "hiddencolumns" + _hist_sym_equal;
//         for (indx = 0; indx < defnColumns.length; indx++) {
//             if (defnColumns[indx].hidden) {
//                 wdgtState = wdgtState + defnColumns[indx].key + '^';
//             }
//         }
//         if (wdgtState.charAt(wdgtState.length - 1) == '^') {
//             wdgtState = wdgtState.substring(0, wdgtState.length - 1);
//         }
//         baseURL = baseURL + wdgtState;
//         wdgtState = '';
// 
//         var sortcolumn = _cur_widget_obj.dataTable.get('sortedBy');
//         if (sortcolumn) {
//             wdgtState = _hist_sym_sep + 'sortcolumn' + _hist_sym_equal + sortcolumn.key + _hist_sym_sep + 'sortdir' + _hist_sym_equal + sortcolumn.dir.substring(7);
//         }
//         baseURL = baseURL + wdgtState;
//         _updateLinkGUI(baseURL);
//     };

    // parse _cur_filter and set _filter
    var _parseFilter = function() { };

    //========================= Event Subscriptions =====================
  var _nav_construct = false;

  this.selfHandler = function(obj) {
    return function(who, arr) {
      var action = arr[0],
          args   = arr[1];
      log('selfHandler: ev='+who+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'decoratorsReady': {
          if ( _initialPageState ) {
            _setState(_initialPageState);
            _initialPageState = null;
          } else {
            _sbx.notify(who,'NavReset');
          }
          break;
        }
        case 'statePlugin': {
          obj.state[args.key] = args;
          break;
        }

// These are to respond to changes in the decorations
        case 'NodeSelected':
        case 'InstanceSelected':
        case 'WidgetSelected':
        case 'addToHistory': {
          obj._addToHistory();
          break;
        }

//         case 'wassitallabout': {
// debugger;
//           log("NavChange:  type=" + args.type + " target=" + args.target +
//               " widget=" + args.widget.widget + " filter=" + args.filter,
//               'info', 'Navigator');
// 
//         // out with the old...
//           _sbx.notify('module','*','destroy');
// //         if (_cur_widget_obj) {
// //             _cur_widget_obj.destroy();
// //             _cur_widget_obj = null;
// //         }
// 
//         // in with the new... (maybe)
//           if (_validConstruction()) {
//             log("NavChange:  construct type=" + _cur_target_type + " target=" + _cur_target +
//                 " widget=" + _cur_widget.widget,
//                 'info', 'Navigator');
//             _nav_construct = true; // prevent interception of our own construct event
//             var a = {};
//             if ( _cur_target_type ) { a[_cur_target_type] = _cur_target; }
//             _sbx.notify('CreateModule',_cur_widget.widget,a);
// 
// //             var widget = PxR.construct(_cur_widget.widget, _cur_target_type, _cur_target,
// //                               'phedex-main', { window: false });
// //             _nav_construct = false;
// //             _cur_widget_obj = widget;
// //             widget.update();
// //             if (widget.dataTable) {
// //                 widget.dataTable.subscribe('renderEvent', _afterRender);   //Assign the function to the event (after column gets sorted)
// //                 widget.dataTable.subscribe('columnShowEvent', _formPermalinkURL);   //Assign the function to the event (after column gets sorted)
// //             }
//             }
//           }
      };
    };
  }(this);

  this.coreHandler = function(obj) {
    return function(ev, arr) {
      log('coreHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      _sbx.notify('Registry','getTypeOfModule',arr[0]);
      if ( arr[1] ) { // I have arguments for this module, when it is created. Stash them globally for later use
        _sbx.notify(obj.id,'NewModule',arr[0]);
        _sbx.notify(obj.id,'NewModuleArgs',arr[1]);
      }
      _sbx.notify('_navCreateModule',arr[0],arr[1]);
    };
  }(this);

    _construct=function() {
      return {
        me:   'Navigator',
        type: 'Navigator',

        decorators: [
          {
            name:   'InstanceSelector',
            parent: 'navigator',
            payload:{
              type: 'menu',
            }
          },
          {
            name:   'TypeSelector',
            parent: 'navigator',
            payload:{
              type: 'menu',
            }
          },
          {
            name:   'TargetTypeSelector',
            parent: 'navigator',
          },
          {
            name:   'WidgetSelector',
            parent: 'navigator',
          },
          {
            name:   'Permalink',
            parent: 'navigator',
          },
        ],

        //========================= Public Methods ==========================
        // init(el, opts)
        //   called when this object is created
        //   div: element the navigator should be built in
        //   opts:  options for the navigator, takes the following:
        //     'typeconfig'   : an array of objects for organizing the type menu.
        //     'widgetconfig' : an array of objects for organizing the widget menu.
        init: function(args) {
          YAHOO.util.History.onReady( (function(obj) {
            return function() {
              setTimeout(function() { obj.create(args); },0); //Initializes the form
            };
          })(this) );
          try {
            YAHOO.util.History.initialize("yui-history-field", "yui-history-iframe");
          } catch (ex) {
            log(ex,'error',obj.me)
            this.create(args);
          }
        },
        create: function(args) {
            this.el  = args.el;
            if ( typeof(this.el) != 'object' ) {
              this.el = document.getElementById(this.el);
            }
            if ( !this.el ) {
              throw new Error('Cannot find element for navigator');
            }

            this.dom.navigator = this.el; // needed for the decorators
            this.cfg = args.cfg;

            // Build GlobalFilter
//             _initGlobalFilter(el);
//             _sbx.notify('Load','phedex-globalfilter',{el:el});

            _sbx.listen(this.id,this.selfHandler);
            _sbx.notify('ModuleExists',this); // let the Core drive my decorators etc
            _sbx.notify(this.id,'loadDecorators',this);
            _sbx.replaceEvent('CreateModule','_navCreateModule');
            _sbx.listen('_navCreateModule',this.coreHandler);
        },
      }
    };
    YAHOO.lang.augmentObject(this, _construct(), true);
};

PHEDEX.Navigator.WidgetSelector = function(sandbox,args) {
  var p    = args.payload,
      obj  = args.payload.obj,
      _sbx = sandbox,
      _widget_menu,
      _widget_menu_items = [],
      _widget,          // the current widget short_name
      _widget_id,       // the current widget id
      _new_widget_name, // name of widget being created by external means (e.g. context-menu)
      _need_new_widget = false, // flag to indicate that a new widget is needed, whatever it may be
      me = 'widgetselector';

  this.id = 'WidgetSelector_' + PxU.Sequence();
  this.el = document.createElement('div');
  this.el.className = 'phedex-nav-component phedex-nav-widget';
  var _getWidgetMenuItems = function(type) {
    var widgets = _widget_menu_items[type],
        menu_items = [];
    for (var w in widgets) {
      w = widgets[w];
      menu_items.push({ text: w.label, value: w });
    }
    return menu_items;
  };

  this.initWidgetSelector = function() {
    _widget_menu = new YAHOO.widget.Button({ 'type': "menu",
      'label': '(widget)',
      'menu': [],
      'container': this.el
    });

    // update state on menu selections
    var onSelectedMenuItemChange = function(o) {
      return function (event) {
        var menu_item = event.newValue;
        var widget = menu_item.value;
        if ( event.prevValue && event.newValue.value.label == event.prevValue.value.label ) { return; }
//     var type = event.newValue.label;
//         if ( _widget == widget.short_name ) { return; }
        _updateWidgetGUI(widget);
        _sbx.notify(obj.id,'WidgetSelected',o.getState());
        _sbx.notify('_navCreateModule',widget.short_name,widget.args);
      }
    }(this);
    _widget_menu.on("selectedMenuItemChange", onSelectedMenuItemChange);
  };

  var _updateWidgetGUI = function(o) {
    return function(widget) {
      if ( _widget_id == widget.id ) { return; }
      _widget_menu.set("label", widget.label);
      _widget_id = widget.id;
      _widget    = widget.short_name;
    };
  }(this);

  this._updateWidgetMenu = function(type,widget_name) {
    log('updateWidgetMenu: type='+type+', widget='+widget,'info',me);
    var menu_items = _getWidgetMenuItems(type),
        widget,
        menu;
    if ( !menu_items.length ) {
      _sbx.notify('Registry','getWidgetsByInputType',type,this.id);
      if ( widget_name ) { _new_widget_name = widget_name; }
      return;
    }
    if ( _new_widget_name ) {
      widget_name = _new_widget_name;
      _new_widget_name = null; // is this premature? What if I pass through here with the wrong menu_items?
    }
    if ( widget_name ) {
      for (var i in menu_items) {
        if ( menu_items[i].value.short_name == widget_name ) {
          widget = menu_items[i].value;
        }
      }
    } else {
       widget = menu_items[0].value; // save first value now; passing to addItems alters structure
    }
    menu = _widget_menu.getMenu(); // _widget_menu is actually a button...
    if (YAHOO.util.Dom.inDocument(menu.element)) {
      menu.clearContent();
      menu.addItems(menu_items);
      menu.render();
    } else {
      menu.itemData = menu_items;
    }
    _updateWidgetGUI(widget); // set menu to first item
    return widget;
  };
  this.isStateValid = function() {
    if ( _widget ) { return true; }
    return false;
  }
  this.getState = function() {
    var state = _widget;
    if ( !state ) { return; }
    if ( state.match('^phedex-module-(.+)$') ) { return RegExp.$1; }
    if ( state.match('^phedex-(.+)$') ) { return RegExp.$1; }
    return state;
  }
  this.maybeCreateWidget = function(widget) {
    if ( _need_new_widget && widget ) {
      _need_new_widget = false;
      _sbx.notify(obj.id,'WidgetSelected',this.getState());
      _sbx.notify('_navCreateModule',widget.short_name,widget.args);
    }
  };
  this.partnerHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('partnerHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'NavReset': {
          break;
        }
        case 'NewModule': {
          _new_widget_name = value;
          break;
        }
        case 'NeedNewModule': {
          _need_new_widget = true;
          break;
        }
        case 'StateChanged': {
          o._updateWidgetMenu(value.type,value.widget);
         _sbx.notify(obj.id,'WidgetSelected',o.getState());
         _sbx.notify('_navCreateModule',value.widget);
          break;
        }
        case 'TargetType': {
          o.maybeCreateWidget( o._updateWidgetMenu(value) );
          break;
        }
        case 'WidgetsByInputType': {
          _widget_menu_items[value] = arr[2];
          if ( ev == o.id ) { // I asked for this, so I must need to update myself
            o.maybeCreateWidget( o._updateWidgetMenu(value) );
          }
          break;
        }
      }
    }
  }(this);
  _sbx.listen(this.id,this.partnerHandler);
  _sbx.listen(obj.id, this.partnerHandler);
  _sbx.notify(obj.id,'statePlugin', {key:'widget', state:this.getState, isValid:this.isStateValid});
  this.initWidgetSelector();
  return this;
};

PHEDEX.Navigator.Permalink = function(sandbox,args) {
  var p    = args.payload,
      obj  = args.payload.obj,
      _sbx = sandbox,
      me = 'permalink';

  this.id = 'Permalink_' + PxU.Sequence();
  this.el = document.createElement('div');
  this.el.className = 'phedex-nav-component phedex-nav-permalink';
  var a = PxU.makeChild(this.el, 'a', { id: 'phedex-nav-filter-link', innerHTML: 'Link', href: '#', title:'Permalink to the current page-state' });
  this.partnerHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value  = arr[1];
      log('partnerHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'NavReset': {
          a.href = document.location.href;
          break;
        }
        case 'UpdatePermalink': {
          if (value) {
            a.href = '#' + value; //Update the link with permalink URL
          } else {
            a.href = document.location.href; //Update the link with current browser URL
          }
          break;
        }
      }
    }
  }(this);
  _sbx.listen(this.id,this.partnerHandler);
  _sbx.listen(obj.id, this.partnerHandler);
  return this;
};

PHEDEX.Navigator.TargetTypeSelector = function(sandbox,args) {
  var p    = args.payload,
      obj  = args.payload.obj,
      _sbx = sandbox,
      _type, // The currently selected type
      _typeArgs = {},   // currently selected arguments for the given types
      _state = {},      // current state for each type
      _moduleArgs = {}, // stored arguments for new module when I don't know what type it is yet
      me = 'targettypeselector';

  this.id = 'TargetTypeSelector_' + PxU.Sequence();
  this.el = document.createElement('div');
  this.el.className = 'phedex-nav-component phedex-nav-targettype';
// create the targetdiv here rather than in the initTargetSelectors to avoid racing for the DOM parent
  var targetdiv = PxU.makeChild(this.el, 'div', { className: 'phedex-nav-component phedex-nav-target' });

  this._initTargetSelectors = function(target_types) {
    if ( this.dom ) { return; }
    this.dom={};
    for (var t in target_types) {
      try {
        this.dom[t] = _selectors[t].init(targetdiv,t);
      } catch (ex) { log(ex,'error',obj.me); banner('Error initialising Navigator, unknown type "'+t+'"!','error'); }
    }
    this._updateTargetSelector();
  };

  _selectors = {
    none: {
      init: function(el) {
        return PxU.makeChild(el, 'div', { 'className': 'phedex-nav-component phedex-nav-target-none' });
       },
      needValue: false,
      updateGUI: function() {
log('Deprecated? TargetTypeSelector._selectors.none.updateGUI','warn',me);
debugger;
      }
    },

    static: {
      init: function(el) {
        return PxU.makeChild(el, 'div');
       },
      needValue: false,
      updateGUI: function() {
        _type = 'static';
      }
    },


    text: {
      init: function(el, type) {
        var sel = PxU.makeChild(el, 'div', { 'className': 'phedex-nav-component phedex-nav-target' }),
           input = PxU.makeChild(sel, 'input', { type: 'text' });
        _selectors[type].needValue = true;
        _selectors[type].updateGUI = function(i) {
          return function() {
            i.value = _state[_type]; // Is this correct? What if Instance has changed?
          }
        }(input);
        return sel;
      },
    },

    node: {
      init: function(el,type) {
        var sel       = PxU.makeChild(el, 'div', { 'className': 'phedex-nav-component phedex-nav-target-nodesel' }),
            input     = PxU.makeChild(sel, 'input', { type: 'text' }),
            container = PxU.makeChild(sel, 'div');
          makeNodeList = function(data) {
            data = data.node;
            var nodelist = [];
            for (var node in data) {
              nodelist.push(data[node].name);
            }
            _buildNodeSelector(input,container,nodelist.sort());
          };
        PHEDEX.Datasvc.Call({ api: 'nodes', callback: makeNodeList });
        _selectors[type].needValue = true;
        _selectors[type].updateGUI = function(i) {
          return function(value) {
            i.value = value;// || _state[_type]; // Is this correct? What if Instance has changed? What if the target is coming from history?
          }
        }(input);
        return sel;
      }
    }

  };
  var _buildNodeSelector = function(input,container,nodelist) {
    var node_ds  = new YAHOO.util.LocalDataSource(nodelist),
        cfg = {
          prehighlightClassName:"yui-ac-prehighlight",
          useShadow: true,
          forceSelection: true,
          queryMatchCase: false,
          queryMatchContains: true,
        },
        auto_comp = new YAHOO.widget.AutoComplete(input, container, node_ds, cfg);
    var nodesel_callback = function(type, args) {
      _state[_type] = args[2][0];
      _typeArgs[_type] = {node:args[2][0]};
      _sbx.notify(obj.id,'NodeSelected',args[2][0]);
      _sbx.notify('module','*','setArgs',{node:args[2][0]});
      _sbx.notify('module','*','getData');
    }
    auto_comp.itemSelectEvent.subscribe(nodesel_callback);
  };
  this._updateTargetSelector = function(type) {
    if ( type ) { _type = type; }
    for (var t in this.dom) {
      var el = this.dom[t];
      if ( t == _type ) {
        el.style.visibility = 'visible';
        el.style.position = 'relative';
      } else {
        el.style.visibility = 'hidden';
        el.style.position = 'absolute';
      }
    }
    return;
  };
  this.isStateValid = function() {
    if ( !_type ) { return false; }
    if ( !_selectors[_type].needValue ) { return true; }
    if ( !_state[_type] ) { return false; }
    return true;
  }
  this.getState = function() {
    return _state[_type];
  }
/* Permit interaction with the navigator
 * @method partnerHandler
 * @param ev {string} name of the event that was sent to this module
 * @param arr {array} array of arguments for the given event
 * @private
 */
  this.partnerHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('partnerHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'NavReset': {
          break;
        }
        case 'NewModuleArgs': {
          _moduleArgs = value;
          break;
        }
        case 'TargetType': {
          o._updateTargetSelector(value);
          if ( _moduleArgs ) {
            var node = _moduleArgs.node; // TODO why am I hardwiring 'node' here? Should I?
            if ( node ) {
              _typeArgs[ _type] = {node:node};
              _selectors[_type].updateGUI(node);
              _sbx.notify(obj.id,'NodeSelected',node);
            }
            _moduleArgs = null;
          }
          break;
        }
        case 'TargetTypes': {
          o._initTargetSelectors(value);
          break;
        }
        case 'StateChanged': {
          if ( value.type && value.type != _type ) {
            o._updateTargetSelector(value.type);
          }
          if ( value.target && value.target != _state[_type] ) {
            _typeArgs[ _type] = {node:value.target};
            _selectors[_type].updateGUI(value.target);
            _sbx.notify(obj.id,'NodeSelected',value.target);
            _sbx.notify('module','*','setArgs',{node:value.target});
            _sbx.notify('module','*','getData');
          }
          break;
        }
        case 'updateTargetGUI': {
log('Deprecated? TargetTypeSelector.partnerHandler.updateTargetGUI','warn',me);
debugger; // I don't think this is actually needed...?
          o[_type].updateTargetGUI(value);
          break;
        }
      }
    }
  }(this);
  _sbx.listen(this.id,this.partnerHandler);
  _sbx.listen(obj.id, this.partnerHandler);
  _sbx.notify('Registry','getTargetTypes');
  this.moduleHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('moduleHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'needArguments': {
          if ( _typeArgs[_type] ) {
            _sbx.notify(arr[1],'setArgs',_typeArgs[_type]);
            _sbx.notify(arr[1],'getData');
          }
        }
      }
    }
  }(this);
  _sbx.listen('module', this.moduleHandler);
  _sbx.notify(obj.id,'statePlugin', {key:'target', state:this.getState, isValid:this.isStateValid});
  return this;
};

PHEDEX.Navigator.TypeSelector = function(sandbox,args) {
  var p    = args.payload,
      obj  = args.payload.obj,
      _sbx = sandbox,
      _target_types,
      _target_type,
      me = 'typeselector';

  this.id = 'TypeSelector_' + PxU.Sequence();
  this.el = document.createElement('div');
  this.el.className = 'phedex-nav-component phedex-nav-type';

  this.setInputTypes = function(types) {
    // get registered target types and store them with optional config params
    _target_types = {};
    for (var i in types) {
      type = types[i];
      var o = { 'name': type, 'label': type, 'order': Number.POSITIVE_INFINITY },
          opts = obj.cfg.typecfg[type] || {};
      YAHOO.lang.augmentObject(o, opts, true);
      _target_types[type] = o;
    }
    _sbx.notify(obj.id,'TargetTypes',_target_types);

    // sort types by object params
    types.sort(function(a, b) {
      return _target_types[a].order - _target_types[b].order;
    });

    // build menu items in sorted order
    var menu_items = [];
    for (var type in types) {
      var o = _target_types[types[type]];
      menu_items.push({ 'text': o.label, 'value': o.name });
    }
    var menu = this.button.getMenu();
    if (YAHOO.util.Dom.inDocument(menu.element)) {
      menu.clearContent();
      menu.addItems(menu_items);
      menu.render();
    } else {
      menu.itemData = menu_items;
    }
  }
  this.button = new YAHOO.widget.Button({ type: "menu",
    label: '(type)',
    menu: [],
    container: this.el
  });
  var onSelectedMenuItemChange = function(event) {
    if ( event.prevValue && event.newValue.value == event.prevValue.value ) { return; }
    var type = event.newValue.value;
    _sbx.notify(obj.id,'NeedNewModule'); // because the target-type has changed, I need to create a new widget for the new type
    _sbx.notify(obj.id,'TargetType',type);
  };
  this.button.on("selectedMenuItemChange", onSelectedMenuItemChange);

  this.isStateValid = function() {
    if ( _target_type ) { return true; }
    return false;
  }
  this.getState = function() {
    return _target_type;
  }
/* Permit interaction with the navigator
 * @method partnerHandler
 * @param ev {string} name of the event that was sent to this module
 * @param arr {array} array of arguments for the given event
 * @private
 */
  this.partnerHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('partnerHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'NavReset': {
          _sbx.notify(obj.id,'TargetTypes',_target_types);
          break;
        }
        case 'TargetType': {
          _target_type = value;
          o.button.set("label", _target_types[value].label);
          break;
        }
        case 'StateChanged': {
          _target_type = value.type;
          o.button.set("label", _target_types[_target_type].label);
          break;
        }
        case 'NeedTargetTypes': {
          _sbx.notify(obj.id,'TargetTypes',_target_types);
          break;
        }
        case 'InputTypes': {
          o.setInputTypes(value);
          break;
        }
      }
    }
  }(this);
  this.registryHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('registryHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'InputTypes': {
          o.setInputTypes(value);
          break;
        }
        case 'TypeOfModule': {
          if ( _target_type == value ) { return; }
          _sbx.notify(obj.id,'TargetType',value);
          break;
        }
      }
    }
  }(this);
  _sbx.listen(this.id,   this.partnerHandler);
  _sbx.listen(obj.id,    this.partnerHandler);
  _sbx.listen('Registry',this.registryHandler);
  _sbx.notify(obj.id,'statePlugin', {key:'type', state:this.getState, isValid:this.isStateValid});
  _sbx.notify('Registry','getInputTypes',this.id);
  return this;
};

PHEDEX.Navigator.InstanceSelector = function(sandbox,args) {
  var p    = args.payload,
      obj  = args.payload.obj,
      _sbx = sandbox,
      instances = PHEDEX.Datasvc.Instances(), // Get current instances
      _instances = {}, menu_items=[],
      _instance,
      indx, jsonInst,
      me = 'instanceselector',
      _stateIsValid = false;

  if (!instances) { throw new Error('cannot determine set of DB instances'); } //Something is wrong.. So dont process further..

  this.id = 'InstanceSelector_' + PxU.Sequence();
  this.el = document.createElement('div');
  this.el.className = 'phedex-nav-component phedex-nav-instance';
  for (indx = 0; indx < instances.length; indx++) {
    jsonInst = instances[indx];
    _instances[jsonInst.instance] = jsonInst;
    menu_items.push({ 'text': jsonInst.name, 'value': jsonInst.name });
   }

  this.menu = new YAHOO.widget.Button({ type: "menu",
    label: '(instance)',
    menu: menu_items,
    container: this.el
  });

  var changeInstance = function(o) {
    return function(instance) {
      var _currInstance = PHEDEX.Datasvc.Instance();
      if ( !instance ) { return; }
      if ( typeof(instance) != 'object' ) {
        instance = PHEDEX.Datasvc.InstanceByName(instance);
      }

      if ( _currInstance.name != instance.name || !_stateIsValid ) {
        PHEDEX.Datasvc.Instance(instance.instance);
        log('change instance to '+instance.name,'info',obj.me);
        o.menu.set("label", instance.name);
        _stateIsValid = true;
      }
    };
  }(this);

  var onSelectedMenuItemChange = function(event) {
    if ( event.prevValue ) {
      if ( event.newValue.value == event.prevValue.value ) { return; }
    } else {
      if ( event.newValue.value == PHEDEX.Datasvc.Instance().instance ) { return; }
    }
    changeInstance(event.newValue.value);
    _sbx.notify(obj.id,'InstanceSelected',event.newValue.value);
    _sbx.notify('module','*','getData');
  };

  this.isStateValid = function() { return _stateIsValid; }
  this.getState = function() {
    return PHEDEX.Datasvc.Instance().name;
  }
  this.menu.on('selectedMenuItemChange', onSelectedMenuItemChange);
/* Permit interaction with the navigator
 * @method partnerHandler
 * @param ev {string} name of the event that was sent to this module
 * @param arr {array} array of arguments for the given event
 * @private
 */
  this.partnerHandler = function(o) {
    return function(ev,arr) {
      var action = arr[0],
          value = arr[1];
      log('partnerHandler: ev='+ev+' args='+YAHOO.lang.dump(arr,1),'info',me);
      switch (action) {
        case 'NavReset': {
          changeInstance('Production');
          break;
        }
        case 'StateChanged': {
          changeInstance(value.instance); //PHEDEX.Datasvc.InstanceByName(value.instance));
          break;
        }
      }
    }
  }(this);
  _sbx.listen(this.id,this.partnerHandler);
  _sbx.listen(obj.id, this.partnerHandler);
  _sbx.notify(obj.id,'statePlugin', {key:'instance', state:this.getState, isValid:this.isStateValid});
  return this;
};

log('loaded...','info','navigator');