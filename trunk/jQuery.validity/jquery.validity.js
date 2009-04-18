﻿/*
 * jQuery.validity beta v0.9.4
 * http://code.google.com/p/validity/
 * 
 * Copyright (c) 2009 Wyatt Allen
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Date: 2009-04-13 (Mon, 13 April 2009)
 * Revision: 21
 */
(function($) {
    //// Private Static /////////////////
    
    var outputModes = {
        modal:"MODAL",
        summary:"SUMMARY",
        label:"LABEL",
        custom:"CUSTOM",
        none:"NONE"
    };

    // Defaults definition.
    var defaults =  {
        outputMode:outputModes.label,
        
        // Methods for custom output modes.
        raiseCustomOutputModeError:function($obj, msg) { },
        raiseCustomOutputModeAggregateError:function($obj, msg) { },
        customOutputModeClear:function() { },
        firstCustomOutputErrorId:function() { },
        
        scrollTo:false,
        summaryOutputWrapper:"<li/>",
        modalErrorsClickable:true
    };
    
    // A jQuery empty set. Used as return value by validators 
    // to terminate execution of a chain.
    var $phi = $([]);
        
    var selectors = {
        summaryContainer:"#validity-summary-container",
        summaryOutput:"#validity-summary-output",
        modalOutput:"body",
        modalErrors:".validity-modal-msg",
        erroneousInputs:".validity-erroneous",
        errorLabels:"label.error"
    };
    
    var classes = {
        modalError:"validity-modal-msg",
        erroneousInput:"validity-erroneous",
        labelError:"error"
    };
    
    var prefixes = {
        modalErrorId:"validity-modal-msg-"
    };
       
    //// Public Static /////////////////
    $.validity = {
        // Settings location
        settings:$.extend(defaults, { }),
        
        patterns: {
            integer:/^\d+/,
            date:/^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/,
            email:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
            usd:/^\$?(\d{1,3},?(\d{3},?)*\d{3}(\.\d{0,2})?|\d{1,3}(\.\d{0,2})?|\.\d{1,2}?)$/,
            url:/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
            number:/^[+-]?(\d*\.?\d*)([eE][+-]?\d+)?$/,
            zip:/^\d{5}(-\d{4})?$/,
            phone:/^([\(]{1}[0-9]{3}[\)]{1}[\.| |\-]{0,1}|^[0-9]{3}[\.|\-| ]?)?[0-9]{3}(\.|\-| )?[0-9]{4}$/
        },
        
        // Remove all errors on the page.
        clear:function() {
            if($.validity.settings.outputMode == outputModes.modal)
                $(selectors.modalErrors).remove();
                
            else if($.validity.settings.outputMode == outputModes.summary) {
                $(selectors.summaryContainer).hide();
                $(selectors.summaryOutput).html('');
                $(selectors.erroneousInputs).removeClass(classes.erroneousInput);
            }
            
            else if($.validity.settings.outputMode == outputModes.label)
                $(selectors.errorLabels).remove();
            
            else if($.validity.settings.outputMode == outputModes.custom)
                $.validity.settings.customOutputModeClear();
        },
        
        // Output an general validation error (withut associated controls)
        // in whatever manner has been configured.
        generalError:function(msg) { raiseError(null, msg); },
        
        // Initialize validity with custom settings.
        setup:function(options) {
            $.validity.settings = $.extend(defaults, options);
            
            // The actual output mode should always be upper cased.
            $.validity.settings.outputMode = $.validity.settings.outputMode.toUpperCase();
        },
        
        // If the expression is false, raise the specified general error.
        // A specific version of this exists for jQuery objects.
        // This is not a debug assertion. It is a validator that is called
        // like a debug assertion.
        assertThat:function(expression, msg) { if(!expression) GeneralError(msg); },
        
        report:null,
        
        isTransactionOpen:function() { return $.validity.report != null; },
        
        start:function() { 
            $.validity.clear();
            $.validity.report = { errors:0, valid:true }; 
        },
        
        end:function() { 
            var report = $.validity.report; 
            $.validity.report = null; 
            
            if ($.validity.settings.scrollTo)
                location.hash = firstErrorId();
            
            return report;
        }
    };
    
    //// Public /////////////////
    
    // Validate whether the field has a value.
    $.fn.require = function(msg) {
        return validate(this, function(obj) { return obj.value.length > 0; }, msg);
    };
    
    // Validate whether the field matches a regex.
    $.fn.match = function(msg, regex) {
        if(typeof(regex) == "string") 
            regex = $.validity.patterns[regex.toLowerCase()];
        
        return validate(this, function(obj) { return obj.value.length == 0 || regex.test(obj.value); }, msg);
    };
    
    $.fn.range = function(msg, min, max) {
        return validate(this, function(obj) { var f = parseFloat(obj.value); return f >= min && f <= max; }, msg);
    };
    
    $.fn.greaterThan = function(msg, min) {
        return validate(this, function(obj) { return parseFloat(obj.value) > min; }, msg);
    };
    
    $.fn.greaterThanOrEqualTo = function(msg, min) {
        return validate(this, function(obj) { return parseFloat(obj.value) >= min; }, msg);
    };
    
    $.fn.lessThan = function(msg, max) {
        return validate(this, function(obj) { return parseFloat(obj.value) < max; }, msg);
    };
    
    $.fn.lessThanOrEqualTo = function(msg, min) {
        return validate(this, function(obj) { return parseFloat(obj.value) <= min; }, msg);
    };
    
    $.fn.maxLength =  function(msg, max) {
        return validate(this, function(obj) { return obj.value.length <= max; }, msg);
    };
    
    // Validate that all matched elements bear the same values.
    // Accepts a function to transform the values for testing.
    $.fn.equal = function(msg, transform) {
        if(transform == null)
            transform = function(val) { return val; };
        
        if(this.length > 0) {
            var temp = transform(this.get(0).value);
            var valid = true;
            
            this.each(
                function() {
                    if(transform(this.value) != temp)
                        valid = false;
                }
            );
            
            if(valid)
                return this;
            else
                raiseAggregateError(this, msg);
        }     
        return $phi;
    };
    
    // Validate that all matched elements bear distinct values.
    // Accepts an optional function to transform the values for testing.
    $.fn.distinct = function(msg, transform) {
        if(transform == null)
            transform = function(val) { return val; };

        if(this.length > 0){
            var values = new Array();
            var valid = true;
            
            this.each(
                function(idx){
                    var transformedValue = transform(this.value);
                    for(i in values){
                        if(transformedValue.length > 0 && values[i] == transformedValue)
                            valid = false;
                    }
                    values[idx] = transformedValue;
                }
            );
            
            if(valid)
                return this;
            else
                raiseAggregateError(this, msg);
        }
        return $phi;
    };
    
    // Validate that the numeric sum of all values is equal to a given value.
    $.fn.sum = function(msg, sum){
        if(this.length > 0){            
            if(sum == numericSum(this))
                return this;
            else
                return $phi;
        }
        return $phi;
    };
    
    // Validates an inclusive upper-bound on the numeric sum of the values of all matched elements.
    $.fn.sumMax = function(msg, max){
        if(this.length > 0){            
            if(max >= numericSum(this))
                return this;
            else
                raiseAggregateError(this, msg);
        }
        return $phi;
    };
    
    // If the expression is false, raise the specified error.
    // This is not a debug assertion. It's a validator
    // that is called like a debug assertion.
    $.fn.assert = function(expression, msg) { if(!expression) raiseError(this, msg); };
    
    //// Private /////////////////
    
    function validate($obj, regimen, message) {
        var elements = new Array();
        $obj.each(
            function() {
                if(regimen(this))
                    elements.push(this);
                else
                    raiseError(this, message);            
            }
        );
        return $(elements);
    }
    
    function addToReport(){
        if($.validity.isTransactionOpen()){
            $.validity.report.errors++;
            $.validity.report.valid = false;
        }
    }
    
    // Raise an error appropriately for the element with the message.
    function raiseError(obj, msg){
        addToReport();
        
        if($.validity.settings.outputMode == outputModes.modal)
            raiseModalError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.summary)
            raiseSummaryError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.label)
            raiseLabelError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.custom)
            $.validity.settings.raiseCustomOutputModeError(obj, msg);
    }
    
    function raiseLabelError(obj, msg){
        var $obj = $(obj);
        
        var errorId = $obj.attr("id");
        var errorSelector = "#" + errorId;
        var labelSelector = "label[for='" + errorId + "']";
        
        if($(labelSelector).length == 0)
            $("<label/>")
                .attr("for", errorId)
                .addClass("error")
                .text(msg)
                .insertAfter(errorSelector);
        else
            $(labelSelector)
                .text(msg);
    }
    
    // Raise an error with a modal message.
    function raiseModalError(obj, msg){
        var $obj = $(obj);
        
        var off = $obj.offset();        
        var errorStyle = { 
            left:parseInt(off.left + $obj.width() + 4) + "px", 
            top:parseInt(off.top - 10) + "px" 
        };
        
        var errorId = prefixes.modalErrorId + $obj.attr("id");
        var errorSelector = "#" + errorId;
        
        if ($(errorSelector).length == 0)
            $("<div/>")
                .attr("id", errorId)
                .addClass(classes.modalError)
                .css(errorStyle)
                .text(msg)
                .click($.validity.settings.modalErrorsClickable ?
                    function() { $(this).remove(); } : null 
                )
                .appendTo(selectors.modalOutput);
        else
            $(errorSelector)
                .css(errorStyle)
                .text(msg);
    }
    
    // Display error in a summary output.
    function raiseSummaryError(obj, msg){
        pumpToSummary(msg);
        
        $(obj).addClass(classes.erroneousInput);
    }
    
    // Merely outputs text to the summary.
    function pumpToSummary(msg) {
        $($.validity.settings.summaryOutputWrapper)
            .text(msg)
            .appendTo(selectors.summaryOutput);
        $(selectors.summaryContainer)
            .show();
    }
    
    // Raise a single error for several elements.
    function raiseAggregateError(obj, msg){
        addToReport();
        
        if($.validity.settings.outputMode == outputModes.modal)
            raiseAggregateModalError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.summary)
            raiseSummaryError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.label)
            raiseAggregateLabelError(obj, msg);
            
        else if($.validity.settings.outputMode == outputModes.custom)
            $.validity.settings.raiseCustomOutputModeAggregateError(obj, msg);
    }
    
    // Raise a modal error on the first matched element.
    function raiseAggregateModalError(obj, msg){
        if(obj.length > 0)
            raiseModalError($(obj.get(0)), msg);
    }
    
    function raiseAggregateLabelError(obj, msg){
        if(obj.length > 0)
            raiseLabelError($(obj.get(obj.length - 1)), msg);
    }
    
    // Yield the sum of the values of all fields matched in obj that can be parsed.
    function numericSum(obj){
        var accumulator = 0;
        obj.each(
            function(){
                var n = parseFloat(this.value);
                if(!isNaN(n))
                    accumulator += n;
            }
        );
        return accumulator;
    }
    
    function firstErrorId() {
        if($.validity.settings.outputMode == outputModes.modal)
            return $(selectors.modalErrors + ":first").attr("id");
               
        else if($.validity.settings.outputMode == outputModes.summary)
            return $(selectors.erroneousInputs + ":first").attr("id");
            
        else if($.validity.settings.outputMode == outputModes.label)
            return $(selectors.errorLabels + ":first").attr("id");
            
        else if($.validity.settings.outputMode == outputModes.custom)
            return $.validity.settings.firstCustomOutputErrorId();
            
        else
            return "_";
    }
})(jQuery);
