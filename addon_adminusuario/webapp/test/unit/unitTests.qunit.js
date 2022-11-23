/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/addon_adminusuario/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
