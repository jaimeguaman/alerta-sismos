var Cliente = function (serverHost, serverPort) {
	var puertoServidor = serverPort;
    var hostServidor = serverHost;
    var urlServidor = serverHost + ':'+ serverPort + '/';

    this.obtieneDatos = function (url, datos, formato,paramExtra,callback) {
    	var ctype={
    		'json':'application/json;charset=utf-8',
    		'jsonp':'text/javascript; charset=utf8',
    		'xml':'application/xml;charset=utf-8'
    	}
        $.ajax({
            url: urlServidor + url,
            data:datos,
            type: "GET",
            accepts:ctype[formato],
            dataType: formato,
            statusCode: {
                200: function (datosRet) {
                    if (typeof (callback) === 'function') callback(paramExtra,datosRet);
                },
                400: function () {
                   //
                },
                404: function () {
                    //
                },
                500: function () {
                    //
                }
            }

        });
    }
    /* TO-DO: OPTIMIZAR 
    this.enviaDatos = function (url, datos, formato, tipo, callback) {
        var ctype = formato == 'json' ? 'application/json;charset=utf-8' : 'application/xml;charset=utf-8'
        $.ajax({
            url: this.urlServidor + url,
            data: datos,
            type: tipo,
            contentType: ctype,
            statusCode: {
                200: function (datosRet) {
                    if (typeof (callback) === 'function') callback(datosRet);
                },
                400: function () {
                    //$("#mensaje").text("Error en la Petición");
                },
                404: function () {
                    //$("#mensaje").text("Datos no Encontrados");
                },
                500: function () {
                    //$("#mensaje").text("Error en el servidor");
                }
            }

        });
    } */
}

var Sismos = function() {
	var _listaSismos = new Array();

	this.agrega = function(params) {
		//params: id, date, time, latitude, longitude, isOficial, nearOfCity, magnitude, depth
		_listaSismos.push({
			id : params.id,
			hora : params.fecha,
			fecha : params.hora,
			latitude : params.latitude,
			longitude : params.longitude,
			isOficial : params.isOficial,
			nearOf : params.nearOfCity,
			magnitude : params.magnitude,
			depth : params.depth,
			url:params.url
		});
	}

	this.obtiene = function(id) {
		var i = 0;
		var encontrado = false;
		for ( i = 0; i < _listaSismos.length; i++) {
			if (_listaSismos[i].id == id) {
				return _listaSismos[i];
				encontrado = true;
				break;
			}
		}
		if (!encontrado) {
			return null;
		}
	}
	this.obtieneTodos = function() {
		return _listaSismos;
	}
}

var Mapa = function () {
    //variables comunes
    this.gMarkers = Array();
    this.gPolygons = Array();
    this.gRectangles = Array();
    this.gIcons = Array();
    this.googleMap = null;
    this.options = Array();

    //crear poligono en mapa
    this.crearPoligono = function (nombre, coordenadas, borde, relleno) {
        var poligono = new google.maps.Polygon({
            paths: coordenadas,
            strokeColor: borde.color,
            strokeOpacity: borde.transparencia,
            strokeWeight: borde.grosor,
            fillColor: relleno.color,
            fillOpacity: relleno.transparencia
        });
        poligono.nombre = nombre;
        poligono.setMap(mapa.googleMap);
        this.gPolygons.push(poligono);

    }

    //crear rectangulo en mapa
    this.crearRectangulo = function (nombre, coordenadas, borde, relleno) {
        var rectangulo = new google.maps.Rectangle({
            bounds: coordenadas,
            strokeColor: borde.color,
            strokeOpacity: borde.transparencia,
            strokeWeight: borde.grosor,
            fillColor: relleno.color,
            fillOpacity: relleno.transparencia

        });
        rectangulo.nombre = nombre;
        rectangulo.setMap(mapa.googleMap);
        this.gRectangles.push(rectangulo);

    }

    //crear marcador a mapa y añadir evento click
    this.crearMarker = function (posicion, nombre, html, titulo, icono, arrastrable) {

        var thisMapa = mapa.googleMap;
        //var cat = this.gIcons[categoria];
		var options={
			position:posicion,
			title:titulo,
			draggable:arrastrable,
			map:thisMapa
		}
		if (icono != null){
			options.icon=icono;
		}
        var marker = new google.maps.Marker(options);
       // marker.categoria = categoria;
        marker.nombre = nombre;
        marker.infoWindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker, "click", function () {
            marker.infoWindow.setContent(html);
            marker.infoWindow.open(thisMapa, marker);
        });

        if (arrastrable) {
            //funcion arbitraria, debe refactorizarse para
            //que permita pasar callback por parametro, además que distinga por tipos de markers.

            google.maps.event.addListener(marker, 'dragend', function () {
                var lat = marker.getPosition().lat();
                var long = marker.getPosition().lng();

            });
        }
        this.gMarkers.push(marker);
        return marker;
    }
	this.markersVisible=function(id_max){
		for (i=0;i < this.gMarkers.length;i++){
			if (id_max >= this.gMarkers[i].nombre){
				this.gMarkers[i].setVisible(true);
			}else{
				this.gMarkers[i].setVisible(false);	
			}
		}
	}
    //inicializar entorno de objeto
    this.init = function (mapaOptions, $contenedor) {
		/*
        this.gIcons.leve = "../images/MapsIcons/m-leve.png";
        this.gIcons.medio = "../images/MapsIcons/m-medio.png";
        this.gIcons.fuerte = "../images/MapsIcons/m-fuerte.png";
        this.gIcons.mega = "../images/MapsIcons/m-mega.png";
		*/
        mapa.options = mapaOptions
        mapa.googleMap = new google.maps.Map($contenedor.get(0), mapa.options);

    }

    //centrar mapa en una ubicacion
    this.centrar = function (latlong) {
        mapa.googleMap.setCenter(latlong);
    }


}

var App=function(opciones){
	this.sismos=new Array();
	this.mapa=new Mapa();
	
	//lazy controls
	this.loads=opciones.loads;
	this.done=0;
	
	this.init=function(listas){
		var server='http://guaman.cl';
		var port='80';
        var opcionesMapa = {
            zoom: 2,
            maxZoom: 20,
            minZoom: 2,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControl:false
        };
        this.mapa.init(opcionesMapa,opciones.contenedorMapa);
 		this.mapa.centrar(new google.maps.LatLng(0,0));
        
        for (i=0;i < listas.length;i++){
        	this.sismos.push({
				nombre:listas[i].nombre,
				contenedor:listas[i].contenedor,
				script:listas[i].script,
				params:listas[i].params,
				origen:listas[i].origen,
				lista:new Sismos(),
				cliente:new Cliente(server,port),
				mapa:this.mapa,
				procesa:listas[i].callbackProcesa,
				render:listas[i].callbackRender
			});
        	
        }


		
	}
	this.getSismos=function(){
		var ret=new Array();
		var that=this;
		for(i=0; i < this.sismos.length;i++){
			ret.push(this.sismos[i].lista.obtieneTodos());
		}
		return ret;
	}
	this.getMapa=function(){
		return this.mapa;
	}
	this.getDatos=function(){
		var self=new Array();
		var info=new Array();
		this.done++;
		for (n =0;n < this.sismos.length; n++){
			self[n]=this.sismos[n];
			this.sismos[n].cliente.obtieneDatos(this.sismos[n].script,this.sismos[n].params,'jsonp',n,function(n,datos){
				
				info={
					nombre:self[n].nombre,
					origen:self[n].origen,
					contenedor:self[n].contenedor,
					done:this.done,
					loads:this.loads
				};
				self[n].procesa(self[n].lista,info,datos,self[n].render);
			});
		}
	}
	this.geolocaliza=function(sismos){
		var html='';
		for (var n=0;n < sismos.length;n++){
			html='';
			html+='<div class="marker-popup">';
			html+='<h2>' + sismos[n].fecha + ' - ' + sismos[n].hora + '</h2>';
			html+='<h3>' + 'Magnitud: ' + sismos[n].magnitude + ' - Profundidad: ' + sismos[n].depth + ' KM </h3>';
			html+='<p>' + 'Lugar: ' + sismos[n].nearOf + '</p>';
			html+='</div>';
			this.mapa.crearMarker(
				new google.maps.LatLng(sismos[n].latitude,sismos[n].longitude),
				sismos[n].id,
				html,
				sismos[n].fecha + ' / ' + sismos[n].magnitude,
				null,
				false
			)
		}
	}
}


//start da party ;)
$(document).on('ready',function(){
	var listas=new Array();
	var todos=new Array();
	//sismos en chile
	listas.push({
		nombre:'chile',
		contenedor:'#ultimos-sismos-shile',
		script:'social2.php',
		params:'r=junar&m=datos&s=byGUID&b=SISMO-CHILE-62403&callback=?',
		origen:'JUNAR',
		callbackProcesa:procesaDatos,
		callbackRender:render,	
	});
	
	//sismos en el mundo
	listas.push({
		nombre:'mundo',
		contenedor:'#ultimos-sismos-mundo',
		script:'social2.php',
		params:'r=usgs&m=datos&b=2.5&n=day&callback=?',
		origen:'USGS',
		callbackProcesa:procesaDatos,
		callbackRender:render,	
	});
	var sismo=new App({contenedorMapa:$('#map_canvas'),loads:listas.length});
	sismo.init(listas);
	sismo.getDatos();
	
	function procesaDatos(listaSismos,info,datos,callback){
		var parcheMes = null;
		var params=new Array();
		var fechaISO,fechaUNIX,dateLength,parcheFecha;
			
		if(info.origen==='USGS'){
			//TO-DO: Refactorizar. no usar $ each a no ser que sea una colección de objetos yikueri.
			$.each(datos.features, function(e, evento) {
				dateLength=evento.properties.time.length;
				parcheFecha=evento.properties.time.substring(0,dateLength - 3);
				
				//BUGFIX, USGS está entregando timestamps de 13 caracteres, año 45007
					cuando = new Date(parcheFecha * 1000);
					parcheMes = cuando.getMonth() + 1;
					//params: id, date, time, latitude, longitude, isOficial, nearOf, magnitude, depth
					params={
						id:parcheFecha, //to-do: debe ser id único.
						hora:cuando.getHours() + ':' + cuando.getMinutes() + ':' + cuando.getSeconds(),
						fecha:dateFormat(cuando,'dd/mm/yyyy'),
						latitude:evento.geometry.coordinates[1],
						longitude:evento.geometry.coordinates[0],
						nearOfCity:evento.properties.place,
						magnitude:evento.properties.mag, 
						depth:evento.geometry.coordinates[2],
						url:evento.properties.url
					};
					listaSismos.agrega(params);		
		
			});
		}
		
		if(info.origen==='JUNAR'){
			var params=new Array();
			var url=null;
			for (var i=datos.result.fArray.length -1; i > 7 ;i -= 8){
				fechaISO=dateFormat(datos.result.fArray[i-7].fStr,"yyyy-mm-dd'T'HH:MM:ss");
				fechaISO=new Date(fechaISO);
				fechaUNIX=parseInt(fechaISO.getTime() / 1000);
				
				params.push({
					id:fechaUNIX,
					hora:dateFormat(datos.result.fArray[i-7].fStr,'H:MM:ss'),
					fecha:dateFormat(datos.result.fArray[i-7].fStr,'dd/mm/yyyy'),
					latitude:datos.result.fArray[i -5].fStr,
					longitude:datos.result.fArray[i - 4].fStr,
					nearOfCity:datos.result.fArray[i].fStr,
					magnitude:datos.result.fArray[i-2].fStr,
					depth:datos.result.fArray[i-3].fStr,
					url:'#'					
				});		
			}
			//LIFO
			for (var i=params.length -1;i >= 0; i-=1){
				listaSismos.agrega(params[i]);	
			}
		}
		if (info.done == info.loads){
			iniciaSlider();
		}
		callback(listaSismos.obtieneTodos(),info.contenedor);
		

	}
	function render(datos,contenedor){
			var magnitud=0;
			
			
			$.each(datos, function(e, evento) {
				clsMag = 'leve';
				magnitud=evento.magnitude;
				if (magnitud >= 1 && magnitud < 4)
					clsMag = 'leve';
				if (magnitud >= 4 && magnitud < 5)
					clsMag = 'sensible';
				if (magnitud >= 5 && magnitud < 6)
					clsMag = 'medio';
				if (magnitud >= 6 && magnitud < 8)
					clsMag = 'fuerte';
				if (magnitud >= 8 && magnitud < 9)
					clsMag = 'mega';
				markup = '<li><div class="grid-2 magnitud-sismo ' + clsMag + '"><h3>' + magnitud + '</h3></div>';
				markup += '<div class="grid-10 info-sismo"><p>' + evento.nearOf + '<br/> Profundidad: ' + evento.depth + 'km </p></div>';
				markup += '<div class="grid-4 link-sismo"><a href="' + evento.url + '">' + evento.fecha + ' ' + evento.hora + '</a></div></li>';
				$(contenedor).append(markup);
			});
			sismo.geolocaliza(datos);
	}

	function iniciaSlider(){
		var ds=sismo.getSismos();
		var is=new Array();
		var fechamax=0,fechamin=0;
		for (i=0;i< ds.length;i++){
			for(j=0;j < ds[i].length;j++){
				is.push(ds[i][j].id);
			}
		}
		fechamax=Math.max.apply(Math,is);
		fechamin=Math.min.apply(Math,is);
		$("#slider").slider({
			range: "max",
			min: fechamin,
			max: fechamax,
			value: fechamax,
			slide: function( event, ui ) {
					$('#fecha-slider').text(dateFormat(new Date(ui.value * 1000),"dd/mm/yyyy - HH:MM:ss" ));
					sismo.getMapa().markersVisible(ui.value);				
			}
		}); 	
		$('#fecha-slider').text(dateFormat(new Date(fechamax * 1000),"dd/mm/yyyy - HH:MM:ss" ) + ' (controla los sismos que se muestran en el mapa, moviendo el slider)');
	}

});


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};
