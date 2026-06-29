'use strict';

/* ==================================== ì´ê¸°UI ì¤í í¨ì í¸ì¶  ==================================== */
function PubUI() {
  var o = this;
  /* í´ë ëì´ ìë */ (o.gnb_footer = function () {
    gnb_footer_resize($('header.header').innerHeight(), $('footer.footer').innerHeight());
  }),
    (o.base = function () {
      var o = 0.01 * window.innerHeight;
      document.documentElement.style.setProperty('--vh', ''.concat(o, 'px')),
        window.addEventListener('resize', function () {
          var o = 0.01 * window.innerHeight;
          document.documentElement.style.setProperty('--vh', ''.concat(o, 'px'));
        });
    }),
    (o.forms = function () {
      /* input del */
      function n(o) {
        ///console.log('$this.val()', $this.val());
        var n = !o.prop('disabled');
        '' != o.val() && n
          ? (o.siblings('button').css({
              display: 'block',
            }),
            o.siblings('button').one('click', function () {
              o.val(''),
                o.siblings('button').css({
                  display: 'none',
                });
            }))
          : o.siblings('button').css({
              display: 'none',
            });
      }
      $('body').on('focusout', '.input_del input', function () {
        n($(this));
      }),
        $('body .input_del input').each(function (o) {
          n($(this));
        }),
        /* select - box */
        $('.select2Basic').select2({
          minimumResultsForSearch: 1 / /*theme: "basic"*/ 0,
        }),
        $('.select2Basic42').select2({
          minimumResultsForSearch: 1 / /*theme: "basic"*/ 0,
        }),
        $('.select2Basic50').select2({
          minimumResultsForSearch: 1 / /*theme: "basic"*/ 0,
        }),
        $('.select2Basic_aa').select2({
          minimumResultsForSearch: 1 / 0,
          dropdownCssClass: 'select_none_line',
          /*theme: "basic"*/
        }),
        $('.select2Basic56_line').select2({
          minimumResultsForSearch: 1 / /*theme: "basic"*/ 0,
        });
    }),
    (o.hartMotion = function () {
      //www.npmjs.com/package/mo-js
      /* var _hartMotion = new mojs.Burst({ left: 0, top: 0, count: 6,
      className : "mojs_hart",
    radius:   { 5: 20 },
    children: { 
    easing: 'cubic.out',
    fill:   "#4DADA7"  ,
    		duration: 500,
    }
    });  */
      $('.js-work_heart').on('click', function (o) {
        o.preventDefault(), $(this).toggleClass('on');
      });
    }),
    (o.scrollTop = function () {
      $('.js-scroll_top').on('click', function (o) {
        o.preventDefault();
        ///$(selector).offset();
        $('html, body').animate(
          {
            scrollTop: 0,
          },
          370
        );
      });
    }),
    (o.mobileBack = function () {
      // $(".js-history_back").click(function() {
      //     window.history.back();
      // });
    }),
    /* íë²í¼ ë³´ì´ê¸° */
    $(window).scroll(function () {
      400 < $(window).scrollTop() ? $('.js-scroll_top').addClass('show') : $('.js-scroll_top').removeClass('show');
    }),
    /* íë²í¼ ëì´ ë³ê²½ */
    $(window).resize(function () {
      0 < $('.proceeding-article').length && $(window).width() < 1024
        ? $('.js-scroll_top').css('transform', 'translateY(-70px)')
        : $('.js-scroll_top').css('transform', '');
    }),
    /* ì´ê¸°ì¤í ì¤í¬ë¦½í¸ */
    (o.append_script = function () {
      ///$("body").append( $(".js-append-script") );
    });
}

/* ==================================== ì´ê¸°ì¤í í¨ì í¸ì¶  ==================================== */ $(function () {
  /* ==================================== ì´ê¸°UI ì¤í í¸ì¶í¨ì í¸ì¶  ==================================== */
  (window.pubUI = new PubUI()),
    window.pubUI.gnb_footer(), // ëì´ ì¤ì 
    ///window.pubUI.base();       // ê¸°ë³¸ì¤í
    window.pubUI.forms(), // í¼ìì
    window.pubUI.hartMotion(), // íí¸ ëª¨ì
    window.pubUI.scrollTop(), // ì¤í¬ë¡¤í
    window.pubUI.mobileBack(), // ëª¨ë°ì¼ ë¤ë¡ê°ê¸°
    window.pubUI.append_script(), // ì¤í¬ë¦½í¸ ì ë
    /* ë¦¬ì¸ì´ì¦ ê³µíµ */
    $(window).on('resize', function () {
      responsiveDevices(), // width  : pc, mobile ì²´í¬
        window.pubUI.gnb_footer();
    }),
    responsiveDevices(),
    window.pubUI.gnb_footer();
});

var _szTB = 1439,
  _szMB = 1023,
  _szMS = 760;

//
//
/* í¸ì¶ */
function responsiveDevices() {
  var o = window.innerWidth, //console.log(_change_width)
    o = _szTB < o || _szMB < o ? 'is_pc' : 'is_mb';
  //  $(window).innerWidth(); //
  return (
    $('body').hasClass(o) ||
      ($('body').removeClass('is_pc is_tb is_mb is_ms'), $('body').addClass(o), $('body').attr('data-device', o)),
    o
  );
}

/* PC,MB images resize */
function imagesResizePcMb() {
  ///document.querySelector(".imageViewer");
  ///console.log("googooowwww: " , _tar[0].naturalWidth, _tar.length);

  for (let o = $('.imageViewer'), e = 0; e < o.length; e++) {
    if (!o[e]) return !1;
    let n = o[e].naturalWidth,
      i = o[e].naturalHeight;

    let windowW = screen.availWidth;
    let windowH = screen.availHeight;

    let pxByObject = parseFloat(1024 / 500); //pc
    // const pxScale= 1024 / 500; //mo

    // let h = parseFloat(windowH) / 2 / 250 * parseFloat($(o[e]).attr("size2"));
    // let w = parseFloat(windowW) / 2 / 250 * parseFloat($(o[e]).attr("size1"));

    const h = $(o[e]).attr('size-y') * pxByObject;
    const w = $(o[e]).attr('size-x') * pxByObject;

    o[e].width = w;
    o[e].height = h;
  }
}

/* íìëì´ê³ì° */ function popup_fixation(o) {
  var n = o,
    e = $('.pop-body>.section', n).outerHeight() + 166,
    t = $(window).height();
  function i() {
    (t = $(window).height()),
      /* ëª¨ë°ì¼ì¼ë && mode-mb_full ê²½ì° ì¬ì©ìí¨ */
      ((!$('body').hasClass('is_mb') || !$('.popup-align', n).hasClass('mode-mb_full')) && t <= e) && !document.querySelector('#popup_alert3-wrap')
        ? $('.popup-align', n).addClass('footer_fixed')
        : $('.popup-align', n).removeClass('footer_fixed');
  }
  $(window).on('resize', function () {
    i();
  }),
    i();
}

/* ëª¨ë°ì¼ ëª¨ì íì */ function popup_motion_open(o) {
  $('body').hasClass('is_mb') &&
    ($('.pop-panel', o).css({
      bottom: '-110vh',
    }),
    $('.pop-panel', o).animate(
      {
        bottom: 0,
      },
      370
    ));
}

function popup_motion_close(o) {
  $('body').hasClass('is_mb') &&
    $('.pop-panel', o).animate(
      {
        bottom: '-110vh',
      },
      370
    );
}

/* ìëì° íì ë«ê¸° 
onclick="window.open('biddingOffline_ko-pc4.html', '','_blank');" 
onclick="javascript:window_close();"
*/
/* ========== ë°ë ëì´ ì¡°ì  ========== */ function gnb_footer_resize(o, n) {
  /*  $('.main-contents') */
  var e = $('header.header').innerHeight(),
    t = $('footer.footer').innerHeight();
  o
    ? ($('#contents').css({
        'padding-top': $('body').hasClass('is_pc') ? '108px' : '61px',
        'padding-bottom': n,
      }),
      $('footer.footer').css({
        'margin-top': -n,
      }))
    : ($('#contents').css({
        'padding-top': e,
        'padding-bottom': t,
      }),
      $('footer.footer').css({
        'margin-top': -t,
      }));
}

function trpScrollTop(o, n) {
  n = $(o).offset().top - ($('header.header').innerHeight() + n);
  $('html, body').animate(
    {
      scrollTop: n,
    },
    300
  );
}
//# sourceMappingURL=maps/pages_common_ko.js.map
function setVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  window.addEventListener('resize', function () {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
}
setVH();
