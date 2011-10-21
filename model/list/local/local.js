steal('jquery/model/list', 'jquery/lang/json', 'jquery/lang/string').then(function($){
/**
 * @plugin jquery/model/list/local
 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/model/list/local/local.js
 * @parent jQuery.Model.List
 * Works exactly the same as [jQuery.Model.List.Cookie] except uses
 * a local store instead of cookies.
 */
$.Model.List.extend("jQuery.Model.List.Local",{
  drivers: {
    'localStorage': {
		// see https://developer.mozilla.org/en/dom/storage#localStorage
		ident: "$.store.drivers.localStorage",
		scope: 'browser',
		available: function()
		{
			try
			{
				// Firefox won't allow localStorage if cookies are disabled
				if (!!window.localStorage) {
					// Safari's "Private" mode throws a QUOTA_EXCEEDED_ERR on setItem
					window.localStorage.setItem("jQuery Store Availability test", true);
					window.localStorage.removeItem("jQuery Store Availability test");
					return true;
				};
				return false;
			}
			catch(e)
			{
				return false;
			}
		},
		init: $.noop,
		get: function( key )
		{
			return window.localStorage.getItem( key );
		},
		set: function( key, value )
		{
			window.localStorage.setItem( key, value );
		},
		del: function( key )
		{
			window.localStorage.removeItem( key );
		},
		flush: function()
		{
			window.localStorage.clear();
		}
	},
    // IE6, IE7
    'userData': {
      // see http://msdn.microsoft.com/en-us/library/ms531424.aspx
      ident: "$.store.drivers.userData",
      element: null,
      nodeName: 'userdatadriver',
      scope: 'browser',
      initialized: false,
      available: function()
      {
        try
        {
          return !!( document.documentElement && document.documentElement.addBehavior );
        }
        catch(e)
        {
          return false;
        }
      },
      init: function()
      {
        // $.store can only utilize one userData store at a time, thus avoid duplicate initialization
        if( this.initialized )
          return;

        try
        {
          // Create a non-existing element and append it to the root element (html)
          this.element = document.createElement( this.nodeName );
          document.documentElement.insertBefore( this.element, document.getElementsByTagName('title')[0] );
          // Apply userData behavior
          this.element.addBehavior( "#default#userData" );
          this.initialized = true;
        }
        catch( e )
        {
          return false;
        }
      },
      get: function( key )
      {
        this.element.load( this.nodeName );
        return this.element.getAttribute( key );
      },
      set: function( key, value )
      {
        this.element.setAttribute( key, value );
        this.element.save( this.nodeName );
      },
      del: function( key )
      {
        this.element.removeAttribute( key );
        this.element.save( this.nodeName );

      },
      flush: function()
      {
        // flush by expiration
        var attrs = this.element.xmlDocument.firstChild.attributes;
        for (var i = attrs.length - 1; i >= 0; i--) {
          this.element.removeAttribute( attrs[i].nodeName );
        }
              this.element.save( this.nodeName );
      }
    },
    // most other browsers
    'windowName': {
      ident: "$.store.drivers.windowName",
      scope: 'window',
      cache: {},
      encodes: true,
      available: function()
      {
        return true;
      },
      init: function()
      {
        this.load();
      },
      save: function()
      {
        window.name = $.store.serializers.json.encode( this.cache );
      },
      load: function()
      {
        try
        {
          this.cache = $.store.serializers.json.decode( window.name + "" );
          if( typeof this.cache != "object" )
            this.cache = {};
        }
        catch(e)
        {
          this.cache = {};
          window.name = "{}";
        }
      },
      get: function( key )
      {
        return this.cache[ key ];
      },
      set: function( key, value )
      {
        this.cache[ key ] = value;
        this.save();
      },
      del: function( key )
      {
        try
        {
          delete this.cache[ key ];
        }
        catch(e)
        {
          this.cache[ key ] = undefined;
        }

        this.save();
      },
      flush: function()
      {
        window.name = "{}";
      }
    }
  },

  get: function( key ){
		var value = this.driver.get( key );
		return this.driver.encodes ? value : $.evalJSON( value );
	},
	set: function( key, value ){
		this.driver.set( key, this.driver.encodes ? value : $.toJSON( value ) );
	},
	del: function( key ){
		this.driver.del( key );
	},
	flush: function(){
		this.driver.flush();
	},
  init: function(){
    var self =this
		// detect and initialize storage driver
		$.each( this.drivers, function(){
			// skip unavailable drivers
			if( !$.isFunction( this.available ) || !this.available() )
				return true; // continue;

			self.driver = this;
			if( self.driver.init() === false )
			{
				self.driver = null;
				return true; // continue;
			}
			return false; // break;
		});
  }
},
{
	retrieve : function(name){
    var Class= this.Class,
        storedData, data
    storedData =  Class.get(name) || '{}'
    if (storedData && storedData.data && storedData.type){
      data = $.String.getObject(storedData['type']).models(storedData['data'])
      this.push(data);
    }
		return this;
	},
	store : function(name){
		var Class = this.Class,
        days = this.days;

		Class.set(name,{
      data: this.serialize(),
      type: this[0] && this[0].constructor.fullName
    })
		return this;
	}
	
});
	
})

