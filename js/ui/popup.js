$(document).ready(function(){
    /*if ($(".otg-list > li").size() > 0 ) {
        $(".otg-list").sortable();
        $(".otg-list").disableSelection();
    } */


    fakeAnimation(".otg-list > li");
    fakeAnimation(".pl-list > li");
    fakeAnimation(".tabs-control-wrapper > li");

    $(".dropdown .opener").on("click", function(e) {
        e.preventDefault();
        var dropBody = $(this).next(".drop-body");

        dropBody.toggleClass("shown");
    })

    $(".otg-social .opener").on("click", function(e) {
        e.preventDefault();
        var dropBody   = $(this).next(".drop-body"),
            holder     = $(".dropwrapper"),
            thatParent = $(this).parents(".item");

        if (holder.is(":visible")) {
            holder.html("")
            holder.hide();
            thatParent.removeClass("hover");
        }
        else {
            holder.show();
            holder.attr("data-index", thatParent.index())
            dropBody.clone(true).appendTo(holder).addClass("shown");
            thatParent.addClass("hover");

        }
    });

    $(document).mouseup(function (e)
    {

        var container  = $(".dropwrapper"),
            container2 = $(".dropdown .drop-body");

        if (container.has(e.target).length === 0)
        {
            var liIndex = container.attr("data-index");
            $(".item").eq(liIndex).removeClass("hover");
            container.hide();
        }

        if (container2.has(e.target).length === 0)
        {
            container2.removeClass("shown")
        }
    });

    function fakeAnimation(el) {
        $(el).append("<span class='before'>")
    }
});







