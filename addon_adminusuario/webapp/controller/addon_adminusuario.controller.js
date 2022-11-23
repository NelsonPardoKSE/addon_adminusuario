sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, Spreadsheet) {
        "use strict";

        return Controller.extend("com.addonadminusuario.controller.addon_adminusuario", {
            onInit: function () {
                this.getOwnerComponent().getRouter().getRoute("Routeaddon_adminusuario").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function () {
                this.generarModeloTabla();
                var propiedad = {
                    countTable: 0
                };
                var oModeloPropiedad = new JSONModel();
                oModeloPropiedad.setData(propiedad);
                this.getView().setModel(oModeloPropiedad, "oModeloPropiedad");
                this.limpiarFiltrosBusqueda();
            },

            limpiarFiltrosBusqueda: function () {
                this.getView().byId("ipNombre").setValue();
                this.getView().byId("tablaUsuarios").getBinding("items").filter([]);
            },

            onSearch: function () {
                var nFactura = this.getView().byId("ipNombre").getValue();

                var andFilters = [];
                if (nFactura !== null && nFactura !== "" && nFactura !== undefined) {

                    andFilters.push(new sap.ui.model.Filter({
                        path: "NOMBRE",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: nFactura,
                        and: true
                    }));
                }


                this.getView().byId("tablaUsuarios").getBinding("items").filter(andFilters);
            },

            generarModeloTabla: function () {
                var datos = [{
                    NOMBRE: "Nelson Pardo",
                    USER: "P000001",
                    RUT: "20.045.765-K",
                    CORREO: "npardo@test.cl",
                    TELEFONO: "923917152",
                    ROLADMIN: "SI",
                    ROLMONITOR: "NO",
                    ROLCONTABILIZADOR: "NO",
                    ROLMAESTRO: "SI"
                }, {
                    NOMBRE: "Luis Lopez",
                    USER: "P000000",
                    RUT: "16.965.487-8",
                    CORREO: "llopez@test.cl",
                    TELEFONO: "954632636",
                    ROLADMIN: "NO",
                    ROLMONITOR: "SI",
                    ROLCONTABILIZADOR: "SI",
                    ROLMAESTRO: "NO"
                }];
                var oModel = new JSONModel(datos);
                this.getView().setModel(oModel, "oModel");
            },

            finishLoading: function (oEvent) {
                var totalDatos = oEvent.getSource().getItems();
                this.getView().getModel("oModeloPropiedad").setProperty("/countTable", totalDatos.length);
            },

            openDlgAddUsuario: function () {
                if (!this.dlgAddUsuario) {
                    this.dlgAddUsuario = sap.ui.xmlfragment("com.addonadminusuario.view.fragment.dlgAddUsuario", this);
                    this.getView().addDependent(this.dlgAddUsuario);
                }
                this.dlgAddUsuario.open();
                this.limpiarVista();
            },

            closedlgAddUsuario: function () {
                this.limpiarVista();
                this.dlgAddUsuario.close();
            },

            limpiarVista: function () {
                sap.ui.getCore().byId("ipNombreIn").setValue();
                sap.ui.getCore().byId("ipRUTIn").setValue();
                sap.ui.getCore().byId("ipCorreoIn").setValue();
                sap.ui.getCore().byId("ipTelefonoIn").setValue();
                sap.ui.getCore().byId("swRolMaestroIn").setState(false);
                sap.ui.getCore().byId("swRolAdministradorIn").setState(false);
                sap.ui.getCore().byId("swRolMonitorIn").setState(false);
                sap.ui.getCore().byId("swRolContabilizadorIn").setState(false);
            },

            registrarUsuario: function () {
                this.dlgAddUsuario.setBusy(true);

                var Nombre = sap.ui.getCore().byId("ipNombreIn").getValue();
                var RUT = sap.ui.getCore().byId("ipRUTIn").getValue();
                var Correo = sap.ui.getCore().byId("ipCorreoIn").getValue();
                var Telefono = sap.ui.getCore().byId("ipTelefonoIn").getValue();
                var RolMaestro = sap.ui.getCore().byId("swRolMaestroIn").getState();
                var RolAdministrador = sap.ui.getCore().byId("swRolAdministradorIn").getState();
                var RolMonitor = sap.ui.getCore().byId("swRolMonitorIn").getState();
                var RolContabilizador = sap.ui.getCore().byId("swRolContabilizadorIn").getState();


                var dataNueva = {
                    NOMBRE: Nombre,
                    USER: "",
                    RUT: RUT,
                    CORREO: Correo,
                    TELEFONO: Telefono,
                    ROLADMIN: this.formatXBoolean(RolAdministrador),
                    ROLMONITOR: this.formatXBoolean(RolMonitor),
                    ROLCONTABILIZADOR: this.formatXBoolean(RolContabilizador),
                    ROLMAESTRO: this.formatXBoolean(RolMaestro)
                };

                console.log(dataNueva)

                this.validarUsuarioCreado(dataNueva.CORREO).then(function (userExist) {
                    if (!userExist.exist) {
                        this.createUser(dataNueva).then(function (datosRetorno) {
                            console.log(datosRetorno)
                            if (datosRetorno.resolve) {
                                var modelo = this.getView().getModel("oModel");
                                var dataModelo = modelo.getData();
                                dataModelo.push(datosRetorno);
                                modelo.setData(dataModelo);
                                modelo.refresh();
                                this.closedlgAddUsuario();
                                MessageBox.success("Se ha registrado un nuevo usuario");
                                this.dlgAddUsuario.setBusy(false);
                            } else {
                                this.dlgAddUsuario.setBusy(false);
                                MessageBox.error("Error al registrar el usuario");
                            }
                        }.bind(this));
                    } else {
                        this.validarUsuarioCreado(dataNueva.CORREO).then(function (user) {
                            console.log(user)
                            dataNueva.USER = user.id;

                            var modelo = this.getView().getModel("oModel");
                            var dataModelo = modelo.getData();
                            dataModelo.push(dataNueva);
                            modelo.setData(dataModelo);
                            modelo.refresh();
                            this.closedlgAddUsuario();
                            MessageBox.success("Se ha registrado un nuevo usuario");
                            this.dlgAddUsuario.setBusy(false);
                        }.bind(this));
                    }
                }.bind(this));

            },

            createUser: function (dataNueva) {
                return new Promise(
                    function resolver(resolve) {
                        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                        var appPath = appId.replaceAll(".", "/");
                        var appModulePath = jQuery.sap.getModulePath(appPath);
                        var url = appModulePath + "/identity/service/scim/Users";

                        $.ajax({
                            url: url,
                            method: "POST",
                            headers: {
                                "Content-Type": "application/scim+json"
                            },
                            data: JSON.stringify({
                                "emails": [
                                    {
                                        "primary": true,
                                        "value": dataNueva.CORREO
                                    }
                                ],
                                "name": {
                                    "familyName": "TEST",
                                    "givenName": dataNueva.NOMBRE
                                },
                                "schemas": [
                                    "urn:ietf:params:scim:schemas:core:2.0:User"
                                ],
                                "userName": dataNueva.CORREO
                            }),
                            success: function (result) {
                                console.log(result)
                                dataNueva.USER = result.id;
                                dataNueva.resolve = true;
                                resolve(dataNueva);
                            }.bind(this),
                            error: function (error) {
                                dataNueva.resolve = false;
                                resolve(dataNueva);
                            }
                        });

                    }.bind(this));

            },

            openDlgEdit: function (oEvent) {
                var context = oEvent.getSource().getBindingContext("oModel");
                var data = context.getObject();
                this.pathEdit = context.getPath();
                console.log(this.pathEdit)
                if (!this.dlgEditUsuario) {
                    this.dlgEditUsuario = sap.ui.xmlfragment("com.addonadminusuario.view.fragment.dlgEditUsuario", this);
                    this.getView().addDependent(this.dlgEditUsuario);
                }
                this.consultarEstadoIAS(data);
            },

            editarUsuario: function () {
                var Nombre = sap.ui.getCore().byId("ipNombreOut").getValue();
                var RUT = sap.ui.getCore().byId("ipRUTOut").getValue();
                var Correo = sap.ui.getCore().byId("ipCorreoOut").getValue();
                var Telefono = sap.ui.getCore().byId("ipTelefonoOut").getValue();
                var RolMaestro = sap.ui.getCore().byId("swRolMaestroOut").getState();
                var RolAdministrador = sap.ui.getCore().byId("swRolAdministradorOut").getState();
                var RolMonitor = sap.ui.getCore().byId("swRolMonitorOut").getState();
                var RolContabilizador = sap.ui.getCore().byId("swRolContabilizadorOut").getState();

                var modelo = this.getView().getModel("oModel");

                modelo.setProperty(this.pathEdit + "/NOMBRE", Nombre);
                modelo.setProperty(this.pathEdit + "/RUT", RUT);
                modelo.setProperty(this.pathEdit + "/CORREO", Correo);
                modelo.setProperty(this.pathEdit + "/TELEFONO", Telefono);
                modelo.setProperty(this.pathEdit + "/ROLADMIN", this.formatXBoolean(RolAdministrador));
                modelo.setProperty(this.pathEdit + "/ROLMONITOR", this.formatXBoolean(RolMonitor));
                modelo.setProperty(this.pathEdit + "/ROLCONTABILIZADOR", this.formatXBoolean(RolContabilizador));
                modelo.setProperty(this.pathEdit + "/ROLMAESTRO", this.formatXBoolean(RolMaestro));

                modelo.refresh();
                this.closedlgEditUsuario();

            },

            closedlgEditUsuario: function () {
                this.dlgEditUsuario.close();
            },

            BorrarSelecciones: function () {
                var otable = this.getView().byId("tablaUsuarios");
                var oDocsSeleccionados = otable.getSelectedItems();
                console.log(oDocsSeleccionados)
                if (oDocsSeleccionados.length !== 0) {
                    for (var i = 0; i < oDocsSeleccionados.length; i++) {
                        oDocsSeleccionados[i].setSelected(false);
                    }
                    MessageBox.success("Se han borrado con éxito los usuarios seleccionados.");
                } else {
                    MessageBox.warning("Seleccionar al menos un usuario para poder realizar la acción borrar.");
                }
            },

            formatBooleanText: function (value) {
                var retorno = true;
                if (value === "NO") {
                    retorno = false;
                }
                return retorno;
            },

            formatXBoolean: function (value) {
                var retorno = "SI";
                if (value === false) {
                    retorno = "NO";
                }
                return retorno;
            },

            onXlsx: function () {
                var aCols, aProducts, oSettings, oSheet;
                aCols = this.createColumnConfig();
                var oModelData = this.getView().getModel("oModel").getData();

                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: oModelData,
                    fileName: "Usuarios.xlsx"
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then(function () {
                        MessageToast.show('La descarga ha finalizado');
                    })
                    .finally(function () {
                        oSheet.destroy();
                    });
            },

            createColumnConfig: function () {
                var aCols = [];
                aCols.push({
                    property: "NOMBRE",
                    label: "Nombre",
                    type: 'string'
                });
                aCols.push({
                    property: "USER",
                    label: "User Provider",
                    type: 'string'
                });
                aCols.push({
                    property: "RUT",
                    label: "RUT",
                    type: 'string'
                });
                aCols.push({
                    property: "CORREO",
                    label: "Correo",
                    type: 'string'
                });
                aCols.push({
                    property: "TELEFONO",
                    label: "Teléfono",
                    type: 'string'
                });
                aCols.push({
                    property: "ROLMAESTRO",
                    label: "Rol Maestro",
                    type: 'string'
                });
                aCols.push({
                    property: "ROLADMIN",
                    label: "Rol Administrador",
                    type: 'string'
                });
                aCols.push({
                    property: "ROLMONITOR",
                    label: "Rol Monitor",
                    type: 'string'
                });
                aCols.push({
                    property: "ROLCONTABILIZADOR",
                    label: "Rol Contabilizador",
                    type: 'string'
                });

                return aCols;
            },

            consultarEstadoIAS: function (datosUser) {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var url = appModulePath + "/identity/service/scim/Users/" + datosUser.USER;

                var settings = {
                    "url": url,
                    "method": "GET",
                    "success": function (oResult) {
                        console.log(oResult)
                        datosUser.EstadoIdentity = "Inactivo";
                        if (oResult.active) {
                            datosUser.EstadoIdentity = "Activo";
                        }

                        this.dlgEditUsuario.open();
                        var oModelDetalle = new JSONModel(datosUser);
                        this.dlgEditUsuario.setModel(oModelDetalle, "oModelDetalle");
                    }.bind(this),
                    "error": function (oError) {
                        console.log(oError)
                        MessageBox.error("No se logro obtener el estado del usuario.");
                    }.bind(this)
                };
                $.ajax(settings);
            },

            validarUsuarioCreado: function (correo) {
                return new Promise(
                    function resolver(resolve) {
                        var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                        var appPath = appId.replaceAll(".", "/");
                        var appModulePath = jQuery.sap.getModulePath(appPath);
                        var url = appModulePath + '/identity/service/scim/Users?filter=emails eq "' + correo + '"';

                        var retorno = {};
                        var settings = {
                            "url": url,
                            "method": "GET",
                            "success": function (oResult) {
                                console.log(oResult)
                                if (oResult.totalResults === 0) {
                                    retorno.exist = false;
                                } else {
                                    retorno = oResult.Resources[0];
                                    retorno.exist = true;
                                }
                                resolve(retorno);
                            }.bind(this),
                            "error": function (oError) {
                                console.log(oError)
                                MessageBox.error("No se logro obtener los datos del usuario.");
                            }.bind(this)
                        };
                        $.ajax(settings);
                    }.bind(this));
            }

        });
    });


