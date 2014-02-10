jQuery.sap.declare("mta.MilestoneTrendAnalysisRenderer");

/**
 * @class MilestoneTrendAnalysis renderer. 
 * @static
 */
mta.MilestoneTrendAnalysisRenderer = {
};


/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 * 
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
 */
mta.MilestoneTrendAnalysisRenderer.render = function(oRm, oControl){ 
	 // write the HTML into the render manager
	 jQuery.sap.require("mta.MilestoneTrendAnalysis");
	 mta.MilestoneTrendAnalysis.adaptChart(oControl);
	 var oHtml = mta.MilestoneTrendAnalysis.tempdoc;
	 var oScript = "<script type='text/javascript' src='/TestApp/mta/EventHandlers.js'></script>";
	 var oOutputstring = oHtml.getElementsByTagName("body")[0].innerHTML + oScript;
	 oRm.write(oOutputstring);
};
