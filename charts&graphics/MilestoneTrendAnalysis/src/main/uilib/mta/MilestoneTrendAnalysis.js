///**
// * This file defines behavior for the control,
// */
jQuery.sap.declare("mta.MilestoneTrendAnalysis");
jQuery.sap.require("sap.ui.thirdparty.d3");
jQuery.sap.require("sap.viz.libs.rgbcolor");


mta.MilestoneTrendAnalysis.prototype.init = function(){
	mta.MilestoneTrendAnalysis.tempdoc = document.implementation.createHTMLDocument("");
	mta.MilestoneTrendAnalysis.keyArray = [];
	mta.MilestoneTrendAnalysis.monthMap = [[1,"Jan"],[2,"Feb"],[3,"Mar"],[4,"Apr"],[5,"May",],[6,"June"],[7,"July"],[8,"Aug"],[9,"Sept"],[10,"Oct"],[11,"Nov"],[12,"Dec"]];
	mta.MilestoneTrendAnalysis.oDummydata = {};
};

mta.MilestoneTrendAnalysis.adaptChart = function(oControl){
	this.width = oControl.getWidth();
	this.height = oControl.getHeight();
	this.margin = {top:50 ,left:100};
	this.width = this.width.substring(0,this.width.length-2);
	this.height = this.height.substring(0,this.height.length-2);
	
	this.svg = d3.select(mta.MilestoneTrendAnalysis.tempdoc.body).append("svg").attr("width",parseInt(this.width) + this.margin.left).attr("height",parseInt(this.height) + this.margin.top).attr("transform","translate(" + this.margin.left.toString() + "," + this.margin.top.toString() + ")");

	//temporary code
	var otempString = oControl.getDummydata();
	this.oDummydata = JSON.parse('{"data":[{"milestonenum":"5040","type":"Delayed","dates":[{"datea":"1/8/2010","dateb":"1/8/2011"},{"datea":"1/2/2011","dateb":"1/8/2011"},{"datea":"1/8/2011","dateb":"1/2/2012"}]},{"milestonenum":"5041","type":"As Planned","dates":[{"datea":"1/8/2010","dateb":"1/10/2011"},{"datea":"1/2/2011","dateb":"1/10/2011"},{"datea":"1/8/2011","dateb":"1/10/2011"}]},{"milestonenum":"5042","type":"Advanced","dates":[{"datea":"1/8/2010","dateb":"1/2/2012"},{"datea":"1/2/2011","dateb":"1/11/2011"},{"datea":"1/8/2011","dateb":"1/9/2011"}]}]}');
	mta.MilestoneTrendAnalysis.oDummydata = this.oDummydata;
	
	
	//permanent code
	this.drawAxis();
	
	this.getaxesTickLoc();
	
	this.drawDiagonal();
	
	this.prepareGrid();

	this.preparePlotting();
	this.rectFlags = [];
	
	for(var objcount=0;objcount<this.oDummydata.data.length;objcount++){
		
		var x1 = 0;
		var y1 = 0;
		var type = this.oDummydata.data[objcount].type;
		
		for(var count=0;count<this.oDummydata.data[objcount].dates.length;count++){
			var month1 = this.getFormatMeasure(this.oDummydata.data[objcount].dates[count].datea);
			
			for(var find=0;find<this.numMap.length;find++){
				if((month1.month==this.numMap[find].month)&&(month1.year==this.numMap[find].year))
					break;
			}
			var monthMap1 = find;
			
			var month2 = this.getFormatMeasure(this.oDummydata.data[objcount].dates[count].dateb);
			
			for(var find=0;find<this.numMap.length;find++){
				if((month2.month==this.numMap[find].month)&&(month2.year==this.numMap[find].year))
					break;
			}
			var monthMap2 = find;
			
			var cx = this.initialX + (this.scaleX * (monthMap1+1));
			var cy = this.initialY - (this.scaleY * (monthMap2+1));
			this.createCircle(cx,cy,type);
			if(count>0)
				this.createLine(x1,y1,cx,cy,type);
			x1 = cx;
			y1 = cy;	
		}
		
		var key = this.oDummydata.data[objcount].milestonenum;
		this.rectFlags.push({flag : 0,key : key});
		//minor hardcoding + 7
		this.createRectangle(x1 + 7,y1,key,type);
	}
	
	this.putAxesTexts();
};

mta.MilestoneTrendAnalysis.drawAxis = function(){
	var monthformat = d3.time.format("%B");
	var yearformat = d3.time.format("%Y");
	var weekformat = d3.time.format("%U");
	
	var oDateRange = this.DateRange();
	
	this.dateToNumMapping(this.getFormatMeasure(oDateRange.start),this.getFormatMeasure(oDateRange.end));
	
	var xscale = d3.time.scale().domain([new Date(parseInt(this.numMap[0].year),parseInt(this.numMap[0].month),1), new Date(parseInt(this.numMap[this.numMap.length-1].year),parseInt(this.numMap[this.numMap.length-1].month),1)]).range([0,parseInt(this.width)]);
	var yscale = d3.time.scale().domain([new Date(parseInt(this.numMap[this.numMap.length-1].year),parseInt(this.numMap[this.numMap.length-1].month),1), new Date(parseInt(this.numMap[0].year),parseInt(this.numMap[0].month),1)]).range([0,parseInt(this.height)]);
	
	var threeyears = 36;
	
	var xAxis;
	var yAxis;
	
	if(this.numMap.length<threeyears){
		mta.MilestoneTrendAnalysis.scaleType = 1;
		xAxis = d3.svg.axis().scale(xscale).tickFormat(monthformat).tickSize(8,0).tickFormat("").orient("top");
		yAxis = d3.svg.axis().scale(yscale).tickFormat(monthformat).tickSize(8,0).tickFormat("").orient("left");
	}
	else{
		mta.MilestoneTrendAnalysis.scaleType = 2;
		xAxis = d3.svg.axis().scale(xscale).ticks(d3.time.years, 1).tickFormat(yearformat).tickSize(8,0).tickFormat("").orient("top");
		yAxis = d3.svg.axis().scale(yscale).ticks(d3.time.years, 1).tickFormat(yearformat).tickSize(8,0).tickFormat("").orient("left");
	}
	
	
	this.svg.append("g").attr("class","xaxis").attr("transform", "translate(" + (this.margin.left/2) + "," + (this.margin.top/2) + ")").call(xAxis);
	this.svg.append("g").attr("class","yaxis").attr("transform", "translate(" + (this.margin.left/2) + "," + (this.margin.top/2) + ")").call(yAxis);
};

mta.MilestoneTrendAnalysis.drawDiagonal = function(){
	this.svg.append("line").attr("class","diagonal").attr("x1",(this.margin.left/2) + parseInt(this.width)).attr("y1",(this.margin.top/2)).attr("x2",(this.margin.left/2)).attr("y2",(this.margin.top/2) + parseInt(this.height));
};

mta.MilestoneTrendAnalysis.getaxesTickLoc = function(){
	this.xAxisIntersects = [];
	this.yAxisIntersects = [];
	var gArray = mta.MilestoneTrendAnalysis.tempdoc.getElementsByTagName("g");
	
	for(var count=0;count<gArray.length;count++){
		var noChilds = gArray[count].childNodes.length;
		if(noChilds>2){
			for(var childcount=0;childcount<noChilds;childcount++){
				if((count==0)&&(gArray[count].childNodes[childcount].getAttribute("transform")!=null))
					this.xAxisIntersects.push(this.getXPoint(gArray[count].childNodes[childcount].getAttribute("transform")));
				else if(gArray[count].childNodes[childcount].getAttribute("transform")!=null)
					this.yAxisIntersects.push(this.getYPoint(gArray[count].childNodes[childcount].getAttribute("transform")));
			}
		}
	}
};

mta.MilestoneTrendAnalysis.getXPoint = function(str){
	var returnstr = "";
	var flag = 0;
	
	for(var count=0;count<str.length;count++){
		if(str[count]=='(')
			flag++;
		else if(str[count]==',')
			flag++;
		else if(flag==1)
			returnstr = returnstr + str[count];
	}
	
	return returnstr;
};

mta.MilestoneTrendAnalysis.getYPoint = function(str){
	var returnstr = "";
	var flag = 0;
	
	for(var count=0;count<str.length;count++){
		if(str[count]==')')
			flag++;
		else if(str[count]==',')
			flag++;
		else if(flag==1)
			returnstr = returnstr + str[count];
	}
	
	return returnstr;
};

mta.MilestoneTrendAnalysis.prepareGrid = function(){
	for(var count=0;count<this.xAxisIntersects.length;count++){
		this.svg.append("line").attr("class","gridlines").attr("x1",(this.margin.left/2) + parseFloat(this.xAxisIntersects[count])).attr("y1",(this.margin.top/2)).attr("x2",(this.margin.left/2) + parseFloat(this.xAxisIntersects[count])).attr("y2",(this.margin.top/2) + parseFloat(this.yAxisIntersects[count]));
	}
	
	for(var count=0;count<this.yAxisIntersects.length;count++){
		this.svg.append("line").attr("class","gridlines").attr("x1",(this.margin.left/2)).attr("y1",(this.margin.top/2) + parseFloat(this.yAxisIntersects[count])).attr("x2",(this.margin.left/2) + parseFloat(this.xAxisIntersects[count])).attr("y2",(this.margin.top/2) + parseFloat(this.yAxisIntersects[count]));
	}
};

mta.MilestoneTrendAnalysis.preparePlotting = function(){
	this.initialX = (this.margin.left/2);
	this.initialY = (this.margin.top/2) + parseFloat(this.yAxisIntersects[0]) + parseFloat(this.yAxisIntersects[this.yAxisIntersects.length-1]);
	
	//hardcoded.will be calculated based on domain to range mapping for axes scales
	var oMonths = this.numMap.length-1;
	
	this.scaleX = (parseFloat(this.xAxisIntersects[this.xAxisIntersects.length-1]) + parseFloat(this.xAxisIntersects[0]))/oMonths;
	this.scaleY = (parseFloat(this.yAxisIntersects[0]) + parseFloat(this.yAxisIntersects[this.yAxisIntersects.length-1]))/oMonths;
	
	var oScaleticks = this.numMap.length;
	
	this.textScaleX = (oScaleticks/this.xAxisIntersects.length);
	this.textScaleY = (oScaleticks/this.yAxisIntersects.length);
};

mta.MilestoneTrendAnalysis.getFormatMeasure = function(datestr){
	//hardcoded to months.will be changed when axes are made dynamic
	//logic for reading date to be changes using Date Object
	var returnmonth = '';
	var returnyear = '';
	var flag = 0;
	
	for(var parsecount=0;parsecount<datestr.length;parsecount++){
		if(datestr[parsecount]=="/")
			flag++;
		else if(flag==1)
			returnmonth = returnmonth + datestr[parsecount];
		else if(flag==2)	
			returnyear = returnyear + datestr[parsecount];
	}
	
	var oReturnMonth = parseInt(returnmonth);
	var oReturnYear = parseInt(returnyear);
	
	return {month : oReturnMonth, year : oReturnYear};
};

mta.MilestoneTrendAnalysis.dateToNumMapping = function(domainStart,domainEnd){
	//hardcoded scale
	this.numMap = [];
	
	var tempstartmonth = domainStart.month;
	var tempstartyear = domainStart.year;
	var tempendmonth = domainEnd.month;
	var tempendyear = domainEnd.year;
	
	for(var mapcount=0;;mapcount++){
		this.numMap.push({month : tempstartmonth, year : tempstartyear});
		
		if((tempstartmonth==tempendmonth)&&(tempstartyear==tempendyear))
			break;
		tempstartmonth++;
		
		if(tempstartmonth>12){
			tempstartmonth = 1;
			tempstartyear++;
		}
	}
};

mta.MilestoneTrendAnalysis.createCircle = function(cx,cy,type){
	//hardcoded radius
	if(type=="Advanced")
		this.svg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",4).attr("class","ctype1");
	else if(type=="As Planned")	
		this.svg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",4).attr("class","ctype2");
	else if(type=="Delayed")
		this.svg.append("circle").attr("cx",cx).attr("cy",cy).attr("r",4).attr("class","ctype3");
};

mta.MilestoneTrendAnalysis.createLine = function(x1,y1,x2,y2,type){
	if(type=="Advanced")
		this.svg.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2).attr("class","ctype1");
	else if(type=="As Planned")	
		this.svg.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2).attr("class","ctype2");
	else if(type=="Delayed")
		this.svg.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2).attr("class","ctype3");
};

mta.MilestoneTrendAnalysis.createRectangle = function(x1,y1,key,type){
	//similar classes will be rtype1,rtype2,rtype3
	//minor hardcoding boxwidth & boxheight
	var boxwidth = 50;
	var boxheight = 20;
	
	this.keyArray.push({key : key,type : type,flag : 0});
	
	if(type=="Advanced")
		this.svg.append("rect").attr("id","r" + key).attr("x",x1).attr("y",y1).attr("width",boxwidth).attr("height",boxheight).attr("rx",10).attr("ry",10).attr("fill","#FFFFFF").attr("stroke","#298A08");
	else if(type=="As Planned")
		this.svg.append("rect").attr("id","r" + key).attr("x",x1).attr("y",y1).attr("width",boxwidth).attr("height",boxheight).attr("rx",10).attr("ry",10).attr("fill","#FFFFFF").attr("stroke","#000000");
	else if(type=="Delayed")
		this.svg.append("rect").attr("id","r" + key).attr("x",x1).attr("y",y1).attr("width",boxwidth).attr("height",boxheight).attr("rx",10).attr("ry",10).attr("fill","#FFFFFF").attr("stroke","#FF0000");
		
	this.svg.append("text").attr("id","t" + key).text(key).attr("x",x1 + (boxwidth/4)).attr("y",y1 + (3 * boxheight/4)).attr("class","textcolor");
};

mta.MilestoneTrendAnalysis.prototype.onclick = function(oBrowserEvent){
	//hardcoded for now
	this.fireClick({Id : this.getId()});
};

mta.MilestoneTrendAnalysis.putAxesTexts = function(){
	
	if(mta.MilestoneTrendAnalysis.scaleType==1){
		var domaincount = 0;
		var rangecount = 0;
	
		for(;rangecount<this.xAxisIntersects.length;rangecount++){
			var textPrepare = "";
			for(var check=0;check<mta.MilestoneTrendAnalysis.monthMap.length;check++){
				if(mta.MilestoneTrendAnalysis.monthMap[check][0]==this.numMap[domaincount].month.toString())
					break;
			}
			textPrepare = textPrepare + mta.MilestoneTrendAnalysis.monthMap[check][1] + "," + this.numMap[domaincount].year.toString();
			this.svg.append("text").text(textPrepare).attr("x",(this.margin.left/2) + parseFloat(this.xAxisIntersects[rangecount]) + 5).attr("y",(this.margin.top/2) - 5).attr("class","textcolor");
			domaincount = domaincount + Math.ceil(this.textScaleX);
		}
	
	
		domaincount = 0;
		rangecount = 0;
	
		for(;rangecount<this.yAxisIntersects.length;rangecount++){
			var textPrepare = "";
			for(var check=0;check<mta.MilestoneTrendAnalysis.monthMap.length;check++){
				if(mta.MilestoneTrendAnalysis.monthMap[check][0]==this.numMap[domaincount].month.toString())
					break;
			}
			textPrepare = textPrepare + mta.MilestoneTrendAnalysis.monthMap[check][1] + "," + this.numMap[domaincount].year.toString();
			this.svg.append("text").text(textPrepare).attr("x",0).attr("y",(this.margin.top/2) + parseFloat(this.yAxisIntersects[rangecount]) - 5).attr("class","textcolor");
			domaincount = domaincount + Math.ceil(this.textScaleY);
		}
	}
	
	else if(mta.MilestoneTrendAnalysis.scaleType==2){
		var uniqueyears = [];
		
		for(var count=0;count<this.numMap.length;count++){
			if((uniqueyears.length==0)||(uniqueyears[uniqueyears.length-1]!=this.numMap[count].year.toString())){
				if(this.numMap[count].month==1)
					uniqueyears.push(this.numMap[count].year.toString());
			}
		}
		
		var rangecount = 0;
		
		for(;rangecount<this.xAxisIntersects.length;rangecount++){
			var textPrepare = "";
			
			textPrepare = textPrepare + uniqueyears[rangecount];
			this.svg.append("text").text(textPrepare).attr("x",(this.margin.left/2) + parseFloat(this.xAxisIntersects[rangecount]) + 5).attr("y",(this.margin.top/2) - 5).attr("class","textcolor");
		}
		
		rangecount = 0;
		
		for(;rangecount<this.yAxisIntersects.length;rangecount++){
			var textPrepare = "";
			
			textPrepare = textPrepare + uniqueyears[rangecount];
			this.svg.append("text").text(textPrepare).attr("x",0).attr("y",(this.margin.top/2) + parseFloat(this.yAxisIntersects[rangecount]) - 5).attr("class","textcolor");
		}
	}
};

mta.MilestoneTrendAnalysis.DateRange = function(){
	var oStartDate = "";
	var oEndDate = "";
	
	for(var objcount=0;objcount<mta.MilestoneTrendAnalysis.oDummydata.data.length;objcount++){
		
		for(var count=0;count<mta.MilestoneTrendAnalysis.oDummydata.data[objcount].dates.length;count++){
			var oFlag = 0;
			var oDay = "";
			var oMonth = "";
			var oYear = "";
			
			for(var parsedate=0;parsedate<mta.MilestoneTrendAnalysis.oDummydata.data[objcount].dates[count].datea.length;parsedate++){
				var oChar = this.oDummydata.data[objcount].dates[count].datea[parsedate];
				
				if(oChar=="/")
					oFlag++;
				else if(oFlag==0)
					oDay = oDay + oChar;
				else if(oFlag==1)
					oMonth = oMonth + oChar;
				else if(oFlag==2)
					oYear = oYear + oChar;
			}
			if(oDay.length==1)
				oDay = "0" + oDay;
			if(oMonth.length==1)
				oMonth = "0" + oMonth;
				
			var oFinal = oYear + oMonth + oDay;
			
			if((oStartDate=="")||(oStartDate>oFinal))
				oStartDate = oFinal;
				
			if((oEndDate=="")||(oEndDate<oFinal))
				oEndDate = oFinal;
				
			oDay = "";
			oMonth = "";
			oYear = "";	
			oFlag = 0;
				
			for(var parsedate=0;parsedate<mta.MilestoneTrendAnalysis.oDummydata.data[objcount].dates[count].dateb.length;parsedate++){
				var oChar = this.oDummydata.data[objcount].dates[count].dateb[parsedate];
				
				if(oChar=="/")
					oFlag++;
				else if(oFlag==0)
					oDay = oDay + oChar;
				else if(oFlag==1)
					oMonth = oMonth + oChar;
				else if(oFlag==2)
					oYear = oYear + oChar;
			}
			if(oDay.length==1)
				oDay = "0" + oDay;
			if(oMonth.length==1)
				oMonth = "0" + oMonth;
				
			oFinal = oYear + oMonth + oDay;
			
			if((oStartDate=="")||(oStartDate>oFinal))
				oStartDate = oFinal;
				
			if((oEndDate=="")||(oEndDate<oFinal))
				oEndDate = oFinal;	
		}
	}
	
	var oFlag = 0;
	var oYear = "";
	var oMonth = "";
	var oDay = "";
	
	for(var properparse=0;properparse<oStartDate.length;properparse++){
		if(oFlag==0)
			oYear = oYear + oStartDate[properparse];
		else if(oFlag==1){
			if(oStartDate[properparse]!="0")
				oMonth = oMonth + oStartDate[properparse];
		}	
		else if(oFlag==2){
			if(oStartDate[properparse]!="0")
				oDay = oDay + oStartDate[properparse];
		}
		
		if((properparse==3)||(properparse==5)){
			oFlag++;
		}
	}
	
	oStartDate = oDay + "/" + oMonth + "/" + oYear;
	
	oFlag = 0;
	oYear = "";
	oMonth = "";
	oDay = "";
	
	for(var properparse=0;properparse<oEndDate.length;properparse++){
		if(oFlag==0)
			oYear = oYear + oEndDate[properparse];
		else if(oFlag==1){
			if(oEndDate[properparse]!="0")
				oMonth = oMonth + oEndDate[properparse];
		}	
		else if(oFlag==2){
			if(oEndDate[properparse]!="0")
				oDay = oDay + oEndDate[properparse];
		}
		
		if((properparse==3)||(properparse==5)){
			oFlag++;
		}
	}
	
	//Changing to sutiably adapt the chart
	var oMinormonthmod = parseInt(oMonth) + 2;
	var oMinoryearmod = parseInt(oYear);
	if(oMinormonthmod>12){
		oMinormonthmod = (oMinormonthmod/12);
		oMinoryearmod++;
	}	
	
	oEndDate = oDay + "/" + oMinormonthmod.toString() + "/" + oMinoryearmod.toString();
	
	return {start : oStartDate, end : oEndDate};
};