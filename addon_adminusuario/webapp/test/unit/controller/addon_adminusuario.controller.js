/*global QUnit*/

sap.ui.define([
	"com/addon_adminusuario/controller/addon_adminusuario.controller"
], function (Controller) {
	"use strict";

	QUnit.module("addon_adminusuario Controller");

	QUnit.test("I should test the addon_adminusuario controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
