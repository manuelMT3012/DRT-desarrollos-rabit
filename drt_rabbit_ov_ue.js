/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(["N/search", "N/record"], function (search, record) {

    function afterSubmit(context) {
        try {

            var recId = context.newRecord.id;
            var recType = context.newRecord.type;
            var currentRecord = record.load({
                type: recType,
                id: recId,
                isDynamic: false,
            });

            log.audit('currentRecord', currentRecord);

            var line = currentRecord.getLineCount({
                sublistId: 'item'
            });

            log.audit('line', line);

            for (var renglon = 0; renglon < line; renglon++) {
                var idItem = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: renglon
                });

                log.audit('idItem', idItem);

                var cantidadItem = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: renglon
                });

                log.audit('cantidadItem', cantidadItem);

                var lookupItem = search.lookupFields({
                    type: search.Type.INVENTORY_ITEM,
                    id: idItem,
                    columns: ['upccode', 'custitem_rb_cases_size_', 'custitem_rb_display_size_']
                });

                log.audit('lookupItem', lookupItem);

                var codigoEan = lookupItem.upccode;

                log.audit('codigoEan', codigoEan);

                var cajas = lookupItem.custitem_rb_cases_size_;
                var display = lookupItem.custitem_rb_display_size_;
                var nCajas = "";
                var nDisplay = "";
                var nPiezas = "";
                var primerResultado = "";
                var segundoResultado = "";
                var cantidadS = "";
                var arregloR = [];

                if (cantidadItem >= cajas) {
                    primerResultado = cantidadItem - cajas;
                    segundoResultado = cantidadItem - primerResultado;
                    log.audit('primerResultado', primerResultado);
                    log.audit('segundoResultado', segundoResultado);
                    if (segundoResultado == cajas) {
                        nCajas = 1;
                        log.audit('nCajas', nCajas);
                    }
                }

                if (primerResultado >= display) {
                    cantidadS = primerResultado;
                    primerResultado = primerResultado - display;
                    segundoResultado = cantidadS - primerResultado;
                    log.audit('primerResultado', primerResultado);
                    log.audit('segundoResultado', segundoResultado);

                    if (segundoResultado == display) {
                        nDisplay = 1;
                        log.audit('nDisplay', nDisplay);
                    }
                }

                nPiezas = primerResultado;

                arregloR.push({
                    codeEan: codigoEan,
                    caja: nCajas,
                    displays: nDisplay,
                    pza: nPiezas
                });

                log.audit('arregloR', arregloR);
            }

            record.submitFields({
                id: recId,
                type: recType,
                values: {
                    custbody_drt_add_information: JSON.stringify(arregloR)
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });


        } catch (error) {
            log.audit('error', error)
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});