//
// jquery.ajaxSubmit.js - Effortlessly submit forms using AJAX and JSON
//
// Developed by Cory LaViska for A Beautiful Site, LLC
//
// Licensed under the MIT license: http://opensource.org/licenses/MIT
//
if(jQuery) (function($) {
    'use strict';

    // Defaults
    $.ajaxSubmit = {
        defaults: {
            loader: '.form-loader',
            message: '.form-message',
            hideInvalid: function(input) {
                $(input).closest('.form-group').removeClass('has-warning');
            },
            showInvalid: function(input) {
                $(input).closest('.form-group').addClass('has-warning');
            }
        }
    };

    // Create the plugin
    $.extend($.fn, {
        ajaxSubmit: function(method, options) {
            if( typeof method === 'object' ) options = method;

            // Public API
            switch(method) {
                case 'busy':
                    return $(this).each(options === false ? unbusy : busy);

                case 'destroy':
                    return $(this).each(destroy);

                case 'disable':
                    return $(this).each(options === false ? enable : disable);

                case 'reset':
                    return $(this).each(reset);

                default:
                    return $(this).each(function() {
                        create.call(this, $.extend({}, $.ajaxSubmit.defaults, options));
                    });
            }
        }
    });

    // Make the form busy
    function busy() {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        $(form)
        .addClass('ajaxSubmit-busy')
        .find(options.loader).prop('hidden', false);
    }

    // Create (initialize) it
    function create(options) {
        $(this)
        .data('options.ajaxSubmit', options)
        .on('submit.ajaxSubmit', submit);
    }

    // Destroy it
    function destroy() {
        $(this)
        .removeData('options.ajaxSubmit')
        .off('.ajaxSubmit');
    }

    // Disable all form elements
    function disable() {
        $(this)
        .addClass('ajaxSubmit-disabled')
        .find(':input').prop('disabled', true);
    }

    // Enable all form elements
    function enable() {
        $(this)
        .removeClass('ajaxSubmit-disabled')
        .find(':input').prop('disabled', false);
    }

    // Hide invalid field errors
    function hideInvalid() {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        // Loop through each invalid field and run `hideInvalid`
        $(form).find('.ajaxSubmit-invalid').each(function() {
            var input = this;
            $(input).removeClass('ajaxSubmit-invalid');
            options.hideInvalid.call(form, input);
        });
    }

    // Hide the form message
    function hideMessage() {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        $(form).find(options.message)
        .text('')
        .prop('hidden', true);
    }

    // Reset the form
    function reset() {
        unbusy.call(this);
        hideInvalid.call(this);
        hideMessage.call(this);
        this.reset();
    }

    // Show invalid field errors
    function showInvalid(fields) {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        // Loop through each invalid field and run `showInvalid`
        $.each(fields, function(index, value) {
            var input = $(form).find(':input[name="' + value + '"]').get(0);
            $(input).addClass('ajaxSubmit-invalid');
            options.showInvalid.call(form, input);
        });
    }

    // Show the form message
    function showMessage(message) {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        $(form).find(options.message)
        .text(message)
        .prop('hidden', false);
    }

    // Handle form submission
    function submit(event) {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        event.preventDefault();

        // Run the before callback. Returning false here will prevent submission.
        if( options.before && options.before.call(form) === false ) return;

        // Make the form busy and hide invalid fields/messages
        hideMessage.call(form);
        hideInvalid.call(form);
        busy.call(form);

        // Send the request
        $.ajax({
            url: $(form).attr('action'),
            type: $(form).attr('method'),
            data: $(form).serializeArray(),
            dataType: 'json'
        })
        .done(function(res) {
            // Remove busy state
            unbusy.call(form);

            // Show the message if `res.message` exists
            if( res && res.message ) {
                showMessage.call(form, res.message);
            }

            // Show invalid fields if `res.invalid` exists
            if( res && res.invalid.length ) {
                showInvalid.call(form, res.invalid);
            }

            // A request is only considered successful if `res.success` is true
            if( res && res.success ) {
                // Run the success callback
                if( options.success ) options.success.call(form, res);
            } else {
                // Run the fail callback
                if( options.fail ) options.fail.call(form, res);
            }

            // Run the after callback
            if( options.after ) options.after.call(form, res);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            // Remove busy state
            unbusy.call(form);

            // Run the error callback
            if( options.error ) options.error.call(form, textStatus, errorThrown);
        });
    }

    // Remove the form's busy state
    function unbusy() {
        var form = this,
            options = $(form).data('options.ajaxSubmit');

        $(form)
        .removeClass('ajaxSubmit-busy')
        .find(options.loader).prop('hidden', true);
    }
})(jQuery);