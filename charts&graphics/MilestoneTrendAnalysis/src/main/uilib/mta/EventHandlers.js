jQuery.sap.declare("mta.EventHandlers");
jQuery.sap.require("mta.MilestoneTrendAnalysis");
jQuery.sap.require("sap.ui.thirdparty.d3");

var keyArray = mta.MilestoneTrendAnalysis.keyArray;

for(var count=0;count<keyArray.length;count++){
	var tempRect = d3.select("#r" + keyArray[count].key);
	var tempType = keyArray[count].type;
	var oResponsivePopover = new sap.m.ResponsivePopover({
		placement : sap.m.PlacementType.Right,
		title : keyArray[count].key
	});
	var oFlag = keyArray[count].flag;
	
	d3.select("#r" + keyArray[count].key).on("click",function(d){
		if(oFlag==0){
			if(tempType=="Advanced")
				d3.select(this).attr("fill","#298A08");
			else if(tempType=="As Planned")
				d3.select(this).attr("fill","#000000");
			else if(tempType=="Delayed")
				d3.select(this).attr("fill","#FF0000");
			oFlag = 1;
		}
		else if(oFlag==1){
			d3.select(this).attr("fill","#FFFFFF");
			oFlag = 0;
		}
		
//		oResponsivePopover.openBy();
	});
	
	d3.select("#t" + keyArray[count].key).on("click",function(d){
		if(oFlag==0){
			if(tempType=="Advanced")
				tempRect.attr("fill","#298A08");
			else if(tempType=="As Planned")
				tempRect.attr("fill","#000000");
			else if(tempType=="Delayed")
				tempRect.attr("fill","#FF0000");
			oFlag = 1;
		}
		else if(oFlag==1){
			tempRect.attr("fill","#FFFFFF");
			oFlag = 0;
		}
	});
}