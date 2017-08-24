  var i=0;
    "use strict";
	$(".frst-timeline-img span").click(function(){
    if ($(this).parent().parent().hasClass("scale-effect")){
    }
    else{
      i=0;
    }
    $(".frst-timeline-style-2 .frst-timeline-block").removeClass("scale-effect");
    $(this).parent().parent().find(".frst-timeline-content-inner h2").removeClass("transition-ease");
    $(this).parent().parent().find(".frst-timeline-content-inner span").removeClass("transition-ease");
    $(this).parent().parent().find(".frst-timeline-content-inner p").removeClass("transition-ease");
		i++;
		if(i%2==0){
    $(this).parent().parent().removeClass("scale-effect");
    $(this).parent().parent().find(".frst-timeline-content-inner h2").addClass("transition-ease");
    $(this).parent().parent().find(".frst-timeline-content-inner span").addClass("transition-ease");
    $(this).parent().parent().find(".frst-timeline-content-inner p").addClass("transition-ease");
		}
		if(i%2==1){
    $(this).parent().parent().addClass("scale-effect");

		}
	});

$(".frst-timeline-style-18 .frst-timeline-content-inner").on("click", function(){
    $(".frst-timeline-block").removeClass("active");
    $(this).parents(".frst-timeline-block").addClass("active");
})
