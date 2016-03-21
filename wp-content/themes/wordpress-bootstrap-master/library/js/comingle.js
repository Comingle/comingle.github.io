jQuery(document).ready(function() {

  function prettyPath() {
    var path = window.location.pathname.split('/');
    var pathLen = path.length - 1;
    var page = path[pathLen];
    var category = path[pathLen-1];
    var prettyPage = page.replace(/-/g, ' ');
    var prettyCat = category.replace(/-/g, ' ');
    return {page: prettyPage, cat: prettyCat};
  }

  function headHier() {
    var h1s = jQuery('h1[id]');
    var h2s, newli;
    var lis = new Array();

    for (var i = 0; i < h1s.length; i++) {
      h2s = jQuery(h1s[i]).nextUntil('h1[id]','h2[id]')
      newli = '<li><a href="#' + h1s[i].id + '">' + 
        jQuery(h1s[i]).text() + '</a>' + (h2s.length > 0 ? '' : '</li>');

      if (h2s.length > 0) {
        newli += "<ul class='nav'>";
        for (var j = 0; j < h2s.length; j++) {
          newli += '<li><a href="#' + h2s[j].id + '">' + '- ' + 
            jQuery(h2s[j]).text() + '</a></li>';
        }
        newli += "</ul></li>";
      }
      lis.push(newli);
    }
    return lis;
  }


  var cm = prettyPath();
  jQuery('#article-title').text(cm.page);
  jQuery('#nav-items').append(headHier());
  jQuery('body').scrollspy({target: "#side-nav", offset: 50});
  setTimeout(delayScrollSpy, 1000);

  function delayScrollSpy() {
    jQuery('body').scrollspy('refresh');
  }

  jQuery(window).on('resize', function() { jQuery('body').scrollspy('refresh'); });

  if ($("#mailing_list_signup").length > 0) {
    var emailEl = "#mailing_list_signup #email";
    var btnEl = "#mailing_list_signup #signup_submit";
    var errEl = "#mailing_list_signup #eme";

    $(btnEl).on('click', function(e) {
      var newClass;
      e.preventDefault();
      /* already validated */
      if ($("input[name='validated']:checked").length > 0) {
        signup($("input[name='validated']:checked").val()).then(allDone());
      } else {
        run_validator($(emailEl).val(), {
          api_key: 'pubkey-93e88ee6738dfc215fd3a3ed72fd204f',
          success: function(data) {
            /* input not quite right. maybe still valid */
            if (data.did_you_mean) {
              var newAddr = data.did_you_mean;
              var oldAddr = $(emailEl).val();
              $(errEl).html('<label for="corrected"><input type="radio" id="corrected" name="validated" value="' + newAddr + '" checked> Did you mean "<em>' + newAddr + '</em>"?</label><label for="asis"><input type="radio" id="asis" name="validated" value="' + oldAddr + '"> No, sign up as "<em>' + oldAddr + '</em>"</label>');
              $(errEl).show();
            } else {
              /* no suggestion so let's go for it */
              if (data.is_valid) {
                signup($(emailEl).val()).then(allDone());
              }
            }
          },
          error: function(e) {
            newClass = 'has-error';
          },
          in_progress: function(e) {
            $(btnEl).attr('disabled', true);
          }
        });
      }
      $(emailEl).parents('.form-group').addClass(newClass);
    });

    function allDone() {
      $(emailEl).parents('.form-group').removeClass('has-error');
      $(errEl).text("Thanks for signing up! You should receive a confirmation email soon.");
      $(errEl).css('display', 'inline');
      $(btnEl).attr('disabled', true);
      newClass = 'has-success';
    }

    function signup(address) {
      return $.ajax({
        type: "POST",
        url: 'https://www.comingle.io/wp-content/themes/wordpress-bootstrap-master/mailing_list_signup.php',
        data: {
          address: address,
        },
        dataType: "json",
      });
    }
  
    $(emailEl).on('focus', function() {
      $("input[name='validated']").remove();
      $(errEl).css('display', 'none');
      $(emailEl).parents('.form-group').removeClass('has-error');
      $(emailEl).parents('.form-group').removeClass('has-success');
      $(btnEl).css('display', 'inline');
      $(btnEl).attr('disabled', false);
    });
  }
 
});
