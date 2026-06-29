import{n as j,j as e,C as se,r,x as V,Q as oe,R as re,P as le,d as ce,M as ae,D as de,e as ue}from"./utils-DMb30fiR.js";import{u as pe,b as he,c as xe,P as ge,B as fe,R as me,a as $}from"./Pagination-rQ6-GbgW.js";import{a as O,A as F,l as B,m as b,g as X}from"./moment-CQ4Rq1DG.js";import{c as N,b as _e,u as we,a as q,G as Te}from"./times-Dxb4vVV_.js";const be=j.div`
  margin: ${t=>t==null?void 0:t.margin};
  height: 40px;
  overflow-x: auto;
  ul {
    display: flex;
    justify-content: flex-start;
    height: auto;
    border-bottom: 0;
    li {
      width: auto;
      display: inline;
      list-style: none;
      box-sizing: border-box;
      text-align: center;
      color: #111;
      background-color: #fff;
      border: 0.5px solid #ccc;
      font-weight: 400;
      font-size: 14px;
      height: 38px;
      box-sizing: border-box;
      line-height: 34px;
      margin-right: 8px;
      border-radius: 3px;
      &.active {
        color: #fff;
        font-weight: 400;
        background-color: #39c3bc;
        border: 0.5px solid #39c3bc;
      }
      button {
        padding: 0 24px;
        width: max-content;
        @media all and (max-width: 1023px) {
          padding: 0 16px;
          font-size: 16px;
          height: 36px;
          line-height: 34px;
        }
      }
    }
  }
`;function ee({list:t,activeIndex:s,margin:l,onClickTab:n}){const d=O();return e.jsx(be,{margin:l,children:e.jsx("ul",{children:t==null?void 0:t.map((i,a)=>e.jsx("li",{className:i.title[d]===t[s].title[d]?"active":"",children:e.jsx("button",{onClick:()=>{i.targetUrl&&(window.location.href=i.targetUrl),n&&n(a)},children:i.title[d]})},a))})})}const De=j.article`
  padding: 40px 15px;
  border-bottom: 1px solid #ededed;
  &:last-child {
    border-bottom: none;
  }
  display: flex;
  justify-content: space-between;
  @media all and (max-width: 1023px) {
    flex-direction: column-reverse;
    padding: 30px 0;
  }
  .thumbnail {
    width: 230px;
    height: 230px;
    position: relative;
    text-align: center;
    background-color: #f6f6f6;
    border: 1px solid #ededed;
    @media all and (max-width: 1023px) {
      margin: auto;
    }
  }
  .auction_info {
    // Live or Online íê·¸
    .type-wrap {
      display: flex;
      justify-content: start;
      align-items: center;
      .type {
        background-color: rgba(255, 0, 0, 0.04);
        color: #ff0000;
        display: inline-block;
        padding: 0 10px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.4px;
        line-height: 19px;
        &.online {
          color: #39c3bc;
          background-color: rgba(57, 195, 188, 0.07);
        }
        &.d-day {
          background-color: #888;
          color: #fff;
          margin: 0;
          margin-left: 5px;
        }
      }
    }
    .title {
      font-size: 24px;
      font-weight: 500;
      color: #333333;
      // font-family: 'Noto Serif KR', serif;
      margin-top: 10px;
    }
    .description {
      margin-top: 20px;
      dl {
        margin-bottom: 7px;
        display: flex;
        font-size: 16px;
        dt {
          width: 65px;
          font-weight: 500;
          color: #333;
        }
        dd {
          color: #333;
          font-weight: 600;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
      }
    }
    button {
      margin-top: 20px;
      width: 170px;
      height: 48px;
      background: transparent;
      border: 1px solid #ebebeb;
      color: #555;
      border-radius: 2px;
      box-sizing: border-box;
    }
    @media all and (max-width: 1023px) {
      margin-top: 20px;
      .type {
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 0;
        line-height: 13px;
        padding: 0 8px;
      }
      .title {
        margin-top: 5px;
        font-size: 18px;
      }
      .description {
        margin-top: 10px;
        dl {
          display: flex;
          font-size: 13px;
          line-height: 1.69;
          margin-bottom: 0;
          dt {
            width: 48px;
          }
        }
      }
      button {
        width: 100%;
      }
    }
  }
`,z={ko:{openTitle:"ì¤íì¼",previewTitle:"íë¦¬ë·°",toDateTitle:"ê²½ë§¤ì¼",moreTitle:"ìì¸ë³´ê¸°"},en:{openTitle:"Open",previewTitle:"Preview",toDateTitle:"Auction",moreTitle:"See More"},zh:{openTitle:"Open",previewTitle:"Preview",toDateTitle:"Auction",moreTitle:"See More"}};function Se({auction:t,lang:s,targetUrl:l,auctionType:n}){var a;const d=t.SALE_IMG_PATH&&t.SALE_IMG_NAME?`${F}${t.SALE_IMG_PATH}/${t.SALE_IMG_NAME}`:n==="progress"?"/images/bg/auction_thumbnail_current_new.png":"https://public.seoulauction.io/resources/assets/images/upcoming/thumb_upcoming_mo.jpg",i=p=>{p.preventDefault(),window.sendLog("click","auction-list-go-sale",{auctionType:n,saleNo:t.SALE_NO}),window.location.href=l};return e.jsxs(De,{children:[e.jsxs("div",{className:"auction_info",children:[e.jsxs("div",{className:"type-wrap",children:[e.jsx("div",{className:`type ${t.SALE_KIND_CD==="Online"?"online":""}`,children:t.SALE_KIND_CD}),t.dDay>0&&t.dDay<=7?e.jsxs("div",{className:"type d-day",children:["D-",t.dDay]}):null,t.dDay==0?e.jsx("div",{className:"type d-day",children:"TODAY"}):null]}),e.jsx("h3",{className:"title",children:B(t.SALE_TH,s)+" "+((a=t==null?void 0:t.TITLE)==null?void 0:a[s])}),e.jsxs("div",{className:"description",children:[e.jsxs("dl",{children:[e.jsx("dt",{children:z[s].openTitle}),e.jsx("dd",{children:t.FROM_DT})]}),t.PREVIEW_JSON.map((p,u)=>e.jsxs("dl",{children:[e.jsx("dt",{children:u===0?z[s].previewTitle:""}),e.jsx("dd",{children:`${p.PLACE_JSON[s]?p.PLACE_JSON[s]+" : ":""}${N(s,p.FROM_DT)} ~ ${N(s,p.TO_DT)}`})]},u)),e.jsxs("dl",{children:[e.jsx("dt",{children:z[s].toDateTitle}),e.jsx("dd",{children:t.TO_DT})]})]}),e.jsx("button",{onClick:i,children:z[s].moreTitle})]}),e.jsx("a",{href:"#",onClick:i,children:e.jsx("figure",{className:"thumbnail",children:e.jsx("img",{src:d,width:"500",height:"500"})})})]})}const je=[{title:{ko:"ì§íê²½ë§¤",en:"Current",zh:"Current"},targetUrl:"/auction-list/progress"},{title:{ko:"ìì ê²½ë§¤",en:"Upcoming",zh:"Upcoming"},targetUrl:"/auction-list/upcoming"}];async function ye(t){try{const{data:s}=await window.axios.get("/api/auction/progress"),{success:l,data:n}=s,d=t==="ko"?"MM/DD(ddd) HH:mm":"DD MMMM HH:mm";if(n.map(i=>{i.SALE_KIND_CD=["online","online_zb"].indexOf(i.SALE_KIND_CD)>-1?"Online":"Live",i.FROM_DT=N(t,i.FROM_DT),i.TO_DT=b(i.TO_DT).format(d)+" KST",i.PREV_FROM_DT=N(t,i.PREV_FROM_DT),i.PREV_TO_DT=N(t,i.PREV_TO_DT),i.PREVIEW_JSON=i.PREVIEW_JSON?JSON.parse(i.PREVIEW_JSON):[],i.TITLE=JSON.parse(i.TITLE_JSON)||{ko:"",en:""},i.dDay=null,i.SALE_TH}),!l)throw new Error("Error");return n||null}catch(s){return console.error(s),null}}async function Ee(t){try{const{data:s}=await window.axios.get("/api/auction/upcoming"),{success:l,data:n}=s,d=t==="ko"?"MM/DD(ddd) HH:mm":"DD MMMM HH:mm";if(n.map(i=>{i.dDay=se(b().format("YYYY-MM-DD"),i.FROM_DT),i.SALE_KIND_CD=["online","online_zb"].indexOf(i.SALE_KIND_CD)>-1?"Online":"Live",i.FROM_DT=i.FROM_DT?N(t,i.FROM_DT):"",i.TO_DT=i.TO_DT?b(i.TO_DT).format(d)+" KST":"",i.PREV_FROM_DT=i.PREV_FROM_DT?N(t,i.PREV_FROM_DT):"",i.PREV_TO_DT=i.PREV_TO_DT?N(t,i.PREV_TO_DT):"",i.PREVIEW_JSON=i.PREVIEW_JSON?JSON.parse(i.PREVIEW_JSON):[],i.TITLE=JSON.parse(i.TITLE_JSON)||{ko:"",en:""},i.SALE_TH}),!l)throw new Error("Error");return n||null}catch{return null}}function te({children:t}){return e.jsx(Ne,{children:e.jsx("div",{className:"page_title",children:t})})}const Ne=j.section`
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 130px;
  min-height: 130px;
  padding: 0 50px;
  .page_title {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    color: #111;
    position: relative;
    font-size: 30px;
    font-weight: 600;
    line-height: 30px;
    .sub-txt {
      color: #555;
      font-size: 18px;
      font-weight: 400;
      vertical-align: 3px;
      &:before {
        content: '\\2758';
        display: inline-block;
        margin: 0 10px 0;
        width: 8px;
        color: #ccc;
      }
    }
  }
  @media all and (max-width: 1023px) {
    height: auto;
    min-height: 90px;
    padding: 15px 25px;
    .page_title {
      font-size: 24px;
    }
  }
`,Oe=j.section`
  margin: 60px auto 120px;
  width: 100%;
  max-width: 1420px;
  padding: 0 50px;
  @media all and (max-width: 1023px) {
    margin: 25px auto 60px;
    padding: 0 25px;
  }
`,Ae=j.article`
  display: flex;
  padding: 188px 0;
  flex-direction: column;
  align-items: center;

  .icon {
    width: 68px;
    height: auto;
    margin-bottom: 20px;
  }
  h3 {
    font-weight: 600;
    font-size: 20px;
    font-weight: 400;
    color: #111;
    margin-bottom: 48px;
    text-align: center;
  }
  button {
    width: 160px;
    height: 48px;
    border: 1px solid #ccc;
    color: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
`,v={pageTitle:{ko:"ê²½ë§¤ì¼ì ",en:"Schedule"},pageSubTitle:{ko:"Schedule",en:""},noCurrentResult:{ko:"ì§íê²½ë§¤ê° ììµëë¤.",en:"There is no current auction.",zh:"There is no current auction."},noUpcomingResult:{ko:"ìì ê²½ë§¤ê° ììµëë¤.",en:"There is no upcoming auction.",zh:"There is no upcoming auction."},goBack:{ko:"ì´ì ì¼ë¡ ì´ë",en:"Go to previous",zh:"Go to previous"}};function ne({allData:t=null}){const s=O(),l=pe(),[n,d]=r.useState(0),[i,a]=r.useState();let p=0;const u=()=>{p++,p<2&&u(),history.back(),p=0};return r.useEffect(()=>{l.pathname.includes("upcoming")?(a("upcoming"),d(1)):(a("progress"),d(0))},[l.pathname]),e.jsxs(e.Fragment,{children:[e.jsx(te,{children:e.jsxs("h2",{className:"page_title",children:[e.jsx("span",{children:v.pageTitle[s]}),s==="ko"&&e.jsx("span",{className:"sub-txt",children:v.pageSubTitle[s]})]})}),e.jsxs(Oe,{children:[e.jsx(ee,{list:je,activeIndex:n}),t&&t.length>0&&e.jsx("div",{style:{marginBottom:"40px"},children:t.map((m,x)=>{let f="";return l.pathname.includes("upcoming")?f=`/auction-list/upcoming/${m.SALE_NO}`:f=`/auction/${m.SALE_KIND_CD.toLowerCase()!=="online"?"live":"online"}/${m.SALE_NO}`,e.jsx(Se,{auctionType:i,auction:m,lang:s,targetUrl:f},x)})}),t&&!(t!=null&&t.length)&&e.jsxs(Ae,{children:[e.jsx("img",{className:"icon",src:"https://public.seoulauction.io/resources/assets/images/common/ico-attention-gray.svg",alt:"ê²½ë§¤ ìì"}),e.jsx("h3",{children:n===0?v.noCurrentResult[s]:v.noUpcomingResult[s]}),e.jsx("button",{onClick:u,children:v.goBack[s]})]})]})]})}function ke(){const t=O(),[s,l]=r.useState(null);return r.useEffect(()=>{(async()=>await l(await ye(t)))()},[t]),e.jsx(ne,{allData:s})}function Le(){const t=O(),[s,l]=r.useState(null);return r.useEffect(()=>{(async()=>{l(await Ee(t))})()},[t]),e.jsx(ne,{allData:s})}const Q=({animation:t,digit:s})=>{const[l,n]=r.useState(t),[d,i]=r.useState(s);return r.useEffect(()=>{t!==l&&n(t),s!==d&&i(s)},[t,s]),e.jsx("div",{className:`flipCard ${l}`,children:e.jsx("span",{children:d})})},Z=({position:t,digit:s})=>{const[l,n]=r.useState(t),[d,i]=r.useState(s);return r.useEffect(()=>{t!==l&&n(t),s!==d&&i(s)},[t,s]),e.jsx("div",{className:l,children:e.jsx("span",{children:d})})},Me={ko:{untilOpenTitle:"ì¤íê¹ì§"},en:{untilOpenTitle:"Until Open Day"}},Y=({digit:t,shuffle:s,unit:l})=>{const n=O(),[d,i]=r.useState("00"),[a,p]=r.useState("00"),[u,m]=r.useState("00"),[x,f]=r.useState("00"),[c,y]=r.useState("fold"),[_,A]=r.useState("unfold");return r.useEffect(()=>{let E=t<10?`0${t}`:t,w;t+1<10?w=`0${t+1}`:t+1===60?w="00":w=t+1,l==="Days"&&(E=`D - ${t}`,w=`D - ${t+1>0?t+1:0}`),i(E),p(w),m(s?w:E),f(s?E:w),y(s?"fold":"unfold"),A(s?"unfold":"fold")},[t,s]),e.jsxs("div",{className:`flipUnitContainer ${l==="Hours"?"hours":""} ${l==="Days"?"days":""}`,children:[e.jsx(Z,{position:"upperCard",digit:d}),e.jsx(Z,{position:"lowerCard",digit:a}),e.jsx("div",{className:"divider"}),e.jsx(Q,{digit:u,animation:c}),e.jsx(Q,{digit:x,animation:_}),e.jsx("p",{className:"unit",children:l==="Days"?Me[n].untilOpenTitle:l})]})};function ve({targetDateTime:t,className:s,setIsNoTimer:l}){const[n,d]=r.useState(-1),[i,a]=r.useState(23),[p,u]=r.useState(59),[m,x]=r.useState(59),[f,c]=r.useState(!0),[y,_]=r.useState(!0),[A,E]=r.useState(!0),[w,I]=r.useState(!0),[R,M]=r.useState(null),S=_e(async()=>{const U=b(t,"YYYY-MM-DD"),G=b(t,"YYYY-MM-DD hh:mm:ss"),k=b(),P=b.duration(U.diff(k.format("YYYY-MM-DD"))),o=b.duration(G.diff(k));M(o);const g=parseInt(String(P.asDays())),h=parseInt(String(o.asHours()));if(g!==n&&d(g),h<=23){d(0);const T=parseInt(String(o.asMinutes()))%60,L=parseInt(String(o.asSeconds()))%60;h!==i&&a(h),T!==p&&u(T),x(L),L<=0&&T<=0&&h<=0&&(a(0),u(0),x(0),M(null),S.stop())}l&&l(Number(o)<=0)},1e3);return r.useEffect(()=>{c(!f)},[n]),r.useEffect(()=>{_(!y)},[i]),r.useEffect(()=>{E(!A)},[p]),r.useEffect(()=>{I(!w)},[m]),r.useEffect(()=>((async()=>await S.start())(),()=>{S.stop()}),[t]),n>0?e.jsx("div",{className:`flipClock days ${s}`,children:e.jsx(Y,{unit:"Days",digit:n,shuffle:f})}):e.jsx("div",{className:`flipClock ${!R&&"no-timer"} ${s}`,children:R&&e.jsxs(e.Fragment,{children:[e.jsx(Y,{unit:"Hours",digit:i,shuffle:y}),e.jsx(Y,{unit:"Minutes",digit:p,shuffle:A}),e.jsx(Y,{unit:"Seconds",digit:m,shuffle:w})]})})}function Ie(t,s,l){return we({queryKey:["auction/upcoming"],refetchOnWindowFocus:!0,refetchOnMount:!0,refetchOnReconnect:!0,staleTime:10*60*1e3,queryFn:async()=>await Re(t,s,l)})}async function Re(t,s,l){try{const{data:n}=await window.axios.get(`/api/auction/upcoming/${t}`),{success:d,data:i}=n;if(d){const a=`https://public.seoulauction.io/resources/assets/images/upcoming/thumb_upcoming_${s?"mo":"pc"}.jpg`,u=(i.SALE_IMG_PATH&&i.SALE_IMG_NAME?`${F}${i.SALE_IMG_PATH}/thum/${i.SALE_IMG_NAME}`:null)??a,m=JSON.parse(i==null?void 0:i.PREVIEW_JSON)||[{FROM_DT:"",TO_DT:"",PLACE_JSON:{en:"",ko:""}}];return{defaultImgUrl:a,thumbnailImgUrl:u,fromDt:b(i.FROM_DT).format("MM/DD(ddd) HH:mm")+" KST",toDt:b(i.TO_DT).format("MM/DD(ddd) HH:mm")+" KST",preview:m==null?void 0:m.map(x=>({...x,FROM_DT:q(x.FROM_DT)||"",TO_DT:q(x.TO_DT)||""})),saleth:i!=null&&i.SALE_TH?B(i.SALE_TH||"",l)+" ":"",title:JSON.parse(i.TITLE_JSON)||{ko:"",en:""},openAt:i==null?void 0:i.FROM_DT,statCd:i==null?void 0:i.STAT_CD,saleKindCd:i==null?void 0:i.SALE_KIND_CD,saleNo:i==null?void 0:i.SALE_NO}}else throw new Error("fetchGetUpcomingAuctionDetail ERROR")}catch(n){return console.log("fetchGetUpcomingAuctionDetail ERROR::",n),null}}const H={ko:{untilOpenTitle:"ì¤íê¹ì§",openTitle:"ì¤íì¼",previewTitle:"íë¦¬ë·°",toDateTitle:"ê²½ë§¤ì¼",moveToListTitle:"ëª©ë¡ë³´ê¸°"},en:{untilOpenTitle:"Until Open Day",openTitle:"Open",previewTitle:"Preview",toDateTitle:"Auction",moveToListTitle:"go to previous"}};function Pe(){var p;const t=O(),s=he(),l=X()==="is_mb",{data:n}=Ie(Number(s.id),l,t),[d,i]=r.useState(!1),a=u=>{u.currentTarget.src=(n==null?void 0:n.defaultImgUrl)??""};return r.useEffect(()=>{n&&(n==null?void 0:n.statCd)==="open"&&(window.location.href=`/auction/${n.saleKindCd.toLowerCase()!=="online"?"live":"online"}/${n.saleNo}`)},[n]),e.jsxs("section",{className:`upcoming-detail-section ${d?"no-timer":""}`,children:[l?e.jsx("img",{className:"bg-img",src:"https://public.seoulauction.io/resources/assets/images/upcoming/bg_upcoming_mo.jpg",alt:""}):e.jsx("img",{className:"bg-img",src:"https://public.seoulauction.io/resources/assets/images/upcoming/bg_upcoming_pc.jpg",alt:""}),e.jsxs("div",{className:"contents-wrap",children:[e.jsx("header",{children:e.jsx("h3",{className:"title",children:(n==null?void 0:n.saleth)+(n==null?void 0:n.title[t])||""})}),(n==null?void 0:n.openAt)&&e.jsx(ve,{targetDateTime:n==null?void 0:n.openAt,className:`${l?"mo":""}`,setIsNoTimer:i}),(n==null?void 0:n.thumbnailImgUrl)!==""&&e.jsx("div",{className:"thumbnail-wrap",children:e.jsx("figure",{children:e.jsx("img",{src:n==null?void 0:n.thumbnailImgUrl.replace("/thum",""),alt:n==null?void 0:n.title[t],width:"400",height:"auto",onError:a,className:"thumbnail-img"})})}),e.jsxs("article",{className:`text-box ${t}`,children:[e.jsxs("dl",{children:[e.jsx("dt",{children:H[t].openTitle}),e.jsx("dd",{children:n==null?void 0:n.fromDt})]}),e.jsxs("dl",{children:[e.jsx("dt",{children:H[t].previewTitle}),e.jsx("dd",{children:(p=n==null?void 0:n.preview)==null?void 0:p.map((u,m)=>e.jsx("span",{children:`${u==null?void 0:u.FROM_DT} ~ ${u==null?void 0:u.TO_DT}${", "+(u==null?void 0:u.PLACE_JSON[t])}`},m+1))})]}),e.jsxs("dl",{children:[e.jsx("dt",{children:H[t].toDateTitle}),e.jsx("dd",{children:n==null?void 0:n.toDt})]})]}),e.jsx(Te,{onClick:()=>window.location.href="/auction-list/upcoming",children:H[t].moveToListTitle})]})]})}const ie=8,Ce={from:0,rows:ie,sale_kind_cd:"",find_word:""},$e=async t=>{try{const s="YYYY.MM.DD(ddd) HH:mm",l="D MMMM YYYY HH:mm",{data:n}=await window.axios.post("/api/auction/results",t),{success:d,data:{list:i,cnt:a}}=n;if(i.map(x=>{const f=x.PREVIEW_JSON?JSON.parse(x.PREVIEW_JSON):[],c=f.length>0?f.map(_=>_.PLACE_JSON):[],y={ko:c.length>0?c.map(_=>_.ko).join(", "):"",en:c.length>0?c.map(_=>_.en).join(", "):""};x.TITLE=x.TITLE_JSON?JSON.parse(x.TITLE_JSON):{ko:"",en:""},x.PLACE=y,x.TO_DT={ko:b(x.TO_DT).format(s)+" KST",en:b(x.TO_DT).format(l)+" KST"},x.END_DT}),!d)throw new Error("Error");const p=Math.ceil(a/t.rows),u=Math.ceil(t.from/t.rows);return{auctionList:i,isLastPage:u===p,nextPage:u+1,totalCount:a}||null}catch{return null}};async function ze(){try{const{data:t}=await window.axios.get("/api/auction/online/me"),{success:s,data:l}=t;if(!s)throw new Error("Error");return{...l}}catch(t){return console.log(t),null}}const Ye=j.article`
  padding: 40px 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .count-box {
    width: 100%;
    color: #111111;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    em {
      color: #39c3bc;
      background-color: #39c3bc1f;
      display: inline-block;
      padding: 0 10px;
      border-radius: 40px;
      font-weight: 600;
      margin-left: 5px;
    }
  }
  /* .search-box {
    width: 320px;
    display: flex;
    justify-content: end;
    form {
      display: flex;
      input {
        width: 250px;
        height: 42px;
        font-size: 16px;
      }
      .reset {
        font-size: 14px;
        line-height: 42px;
        text-decoration: underline;
        color: #999;
        text-align: center;
        position: relative;
        width: 70px;
        border-radius: 5px;
      }
    }
  } */
  @media all and (max-width: 1023px) {
    flex-direction: column-reverse;
    padding: 10px 0 0;

    .search-box {
      width: 100%;
    }
    .count-box {
      font-size: 14px;
      margin: 20px 0;
    }
  }
`,He=j.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  width: 100%;
  column-gap: 20px;
`,Fe=j.li`
  width: calc(50% - 10px);
  margin-bottom: 50px;
  border-bottom: 1px solid #e5e5e5;
  position: relative;

  .btn_go-result {
    position: absolute;
    bottom: 26px;
    right: 0;
    background: transparent;
    border: 1px solid #ccc;
    color: #555;
    border-radius: 2px;
    width: 170px;
    min-width: 170px;
    height: 50px;
    font-family: 'Pretendard';
    color: inherit;
    font-weight: 500;
    font-size: 16px;
    line-height: 36px;
    box-sizing: border-box;
    vertical-align: middle;
    padding: 5px 15px;
    &:hover {
      border: 1px solid #111;
      color: #111;
    }
  }
  .image-area {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 52.1538%;
    border-radius: 5px;
    a {
      position: absolute;
      right: 0;
      left: 0;
      vertical-align: middle;
      width: auto;
      height: 100%;
      text-align: center;
      font-size: 0;
      overflow: hidden;
      border-radius: 5px;
      img {
        width: 100%;
        height: auto;
        max-width: unset;
        max-height: unset;
        border-radius: 5px;
        min-height: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  .description {
    padding: 35px 40px 40px;
    .title {
      font-size: 24px;
      font-weight: 500;
      color: #333333;
      margin-bottom: 10px;
    }
    .info-box {
      font-size: 18px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;

      .info {
        margin-right: 10px;
        color: #555;
        width: calc(100% - 180px);
        dl,
        dd {
          font-size: 18px;
          display: flex;
          font-weight: 500;
        }
        .place {
          margin-top: 5px;
        }
      }
    }
  }

  @media all and (max-width: 1120px) {
    .description {
      .info-box {
        /* flex-direction: column; */
        /* button {
          width: 100%;
          margin-top: 25px;
        } */
      }
    }
  }
  @media all and (max-width: 1023px) {
    width: 100%;
    .btn_go-result {
      font-size: 14px;
      height: 45px;
      line-height: 100%;
      position: relative;
      width: 100%;
      bottom: auto;
      right: auto;
      margin-bottom: 20px;
    }
    .description {
      padding: 15px 20px 20px;
      .title {
        font-size: 18px;
      }
      .info-box {
        .info {
          margin-right: 0;
          width: 100%;
          dl,
          dd {
            font-size: 13px;
          }
          .place {
            margin-top: 3px;
          }
        }
        /* button {
          font-size: 14px;
          height: 45px;
          line-height: 100%;
        } */
      }
    }
  }
`,Ue=j.section`
  margin: 0 auto 120px;
  width: 100%;
  max-width: 1420px;
  padding: 60px 50px 0 50px;
  @media all and (max-width: 1023px) {
    padding: 30px 25px;
  }
`,D={pageTitle:{ko:"ê²½ë§¤ê²°ê³¼",en:"Results"},pageSubTitle:{ko:"Result",en:""},totalTitle:{ko:"ì´",en:"Total"},searchTitle:{ko:"ê²½ë§¤ëª ê²ì",en:"Auction name"},showResultTitle:{ko:"ê²°ê³¼ë³´ê¸°",en:"View Results"},resetTitle:{ko:"ì´ê¸°í",en:"reset"},searchResultTitle:{ko:"ê²ìê²°ê³¼ê° ììµëë¤.",en:"No results were found for your search."},searchResultDesc:{ko:"ë¨ì´ì ì² ìë ëì´ì°ê¸°ê° ì ííì§ íì¸í´ì£¼ì¸ì.",en:"Please check whether the spelling or spacing of the word is correct."},exhibitionEnd:{ko:"ì¢ë£ë ì ììëë¤.",en:"This exhibition has ended."},liveResults:{ko:"ë¼ì´ë¸ ê²½ë§¤ ê²°ê³¼ë ì¢ë£ í 1ë ì´ë´ì ê²½ë§¤ì¸ ê²½ì°ë§ íì¸ ê°ë¥í©ëë¤.",en:"The results of live auctions can only available for auctions that ended within one year."},onlineResults:{ko:'ì¨ë¼ì¸ ê²½ë§¤ê²°ê³¼ë ê²½ë§¤ë¹ì¼ê¹ì§ë§ "ê²°ê³¼ë³´ê¸°"ê° ê°ë¥í©ëë¤.',en:'Online auction results are only "available" within the day of the auction.'},notAllowedAuction:{ko:'í´ë¹ ê²½ë§¤ë ê²½ë§¤ ë¹ì¼ê¹ì§ë§ "ê²°ê³¼ë³´ê¸°"ê° ê°ë¥í©ëë¤.',en:'This auction result is only "available" witin the day of the auction.'}},W=[{title:{ko:"ì ì²´",en:"All"}},{title:{ko:"ë¼ì´ë¸",en:"Live"}},{title:{ko:"ì¨ë¼ì¸",en:"Online"}},{title:{ko:"íì½©",en:"Hongkong"}},{title:{ko:"ê¸°í",en:"etc"}}],Ge=j.section`
  padding: 100px 0;
  text-align: center;
  img {
    width: 74px;
  }
  h2 {
    margin-top: 35px;
    font-size: 24px;
    font-weight: 600;
    color: #333333;
  }
  p {
    margin-top: 10px;
    font-size: 16px;
    font-weight: 500;
    color: #555555;
    line-height: 1.5;
  }
`;function Je(){var P;const t=O(),[s,l]=r.useState(0),n=Ce,[d,i]=r.useState(!1),[a,p]=xe(),[u]=r.useState(Number(a.get("page"))),[m]=r.useState(a.get("sale-kind-cd")),[x]=r.useState(a.get("keyword")),f=r.useRef(null),[c,y]=r.useState(),_=X()==="is_mb",[A,E]=r.useState(!1),w=r.useRef(null),I=Number(sessionStorage.getItem("scrollY")),R=async()=>{i(!1),f.current&&f.current.value.length>0&&(f.current.value=""),n.from=0,n.sale_kind_cd="",n.find_word="",await S(n),p({}),l(0)},M=r.useCallback(()=>{var g,h;const o={};a.get("sale-kind-cd")&&(o["sale-kind-cd"]=a.get("sale-kind-cd")),p({...o,keyword:((g=f==null?void 0:f.current)==null?void 0:g.value.trim())??""}),n.find_word=((h=f==null?void 0:f.current)==null?void 0:h.value.trim())??"",n.from=0,window.sendLog("click","auction-list-result-search",{keyword:n.find_word}),S({...n}),i(!0)},[n]),S=async(o,g=!1)=>{E(!0);const h=await $e(o)??{};y(g?T=>({...h,auctionList:[...(T==null?void 0:T.auctionList)||[],...(h==null?void 0:h.auctionList)||[]]}):h),E(!1)},U=async o=>{const g=Math.ceil(o/ie),h={};h.page=g,a.get("sale-kind-cd")&&(h["sale-kind-cd"]=a.get("sale-kind-cd")),a.get("keyword")&&(h.keyword=a.get("keyword")),p({...h}),n.from=o,n.find_word=a.get("keyword")??"",await S({...n})},G=async o=>{if(sessionStorage.setItem("scrollY",window.scrollY.toString()),sessionStorage.getItem("is_login")!=="true"){window.location.href="/login";return}if(["exhibit","exhibit_sa"].indexOf(o.SALE_KIND_CD)>-1){alert(D.exhibitionEnd[t]);return}const g=await ze(),h=["online","online_zb"].indexOf(o.SALE_KIND_CD)>-1,T=["main","hongkong","plan"].indexOf(o.SALE_KIND_CD)>-1;if((g==null?void 0:g.IS_EMPLOYEE)==="N"){if(o.SALE_NO===872){alert(D.notAllowedAuction[t]);return}if(T&&o.IS_OLD_SALE==="Y"){alert(D.liveResults[t]);return}const L=V(o.END_DT).format("YYYY-MM-DD"),J=V().format("YYYY-MM-DD"),C=V(J).isAfter(L);if(h&&C){alert(D.onlineResults[t]);return}}window.sendLog("click","auction-list-result-go-sale",{saleKindCd:o.SALE_KIND_CD,saleNo:o.SALE_NO}),window.location.href=`/auction/${h?"online":"live"}/${o.SALE_NO}`},k=o=>{p(g=>(g.delete(o),g))};return r.useEffect(()=>{(async()=>(n.from=_?0:u*n.rows,n.rows=_?20:n.rows,n.sale_kind_cd=m,n.find_word=x,await S(n)))(),u||k("page"),f&&f.current&&(f.current.value=x),x&&i(!0),W.filter((o,g)=>{o.title.en.toLowerCase()===m&&l(g)})},[u,m,x,_]),r.useEffect(()=>{var o;_&&(c!=null&&c.auctionList)&&((o=c==null?void 0:c.auctionList)==null?void 0:o.length)>0&&I&&(window.scroll(0,I),sessionStorage.removeItem("scrollY"))},[c]),r.useEffect(()=>{if(!_)return;const o=new IntersectionObserver(g=>{g[0].isIntersecting&&!A&&(c!=null&&c.nextPage)&&!c.isLastPage&&(n.from=c.nextPage*n.rows,S(n,!0))});return w.current&&o.observe(w.current),()=>o.disconnect()},[_,c==null?void 0:c.nextPage,c==null?void 0:c.isLastPage,A]),e.jsxs(e.Fragment,{children:[e.jsx(te,{children:e.jsxs("h2",{className:"page_title",children:[D.pageTitle[t],t==="ko"&&e.jsx("span",{className:"sub-txt",children:D.pageSubTitle[t]})]})}),e.jsxs(Ue,{children:[e.jsx(ee,{list:W,activeIndex:s,onClickTab:async o=>{if(o!==s){const g=o>0?W[o].title.en.toLowerCase():"";if(g==="")k("page"),k("sale-kind-cd");else{const h={};h["sale-kind-cd"]=g,a.get("keyword")&&(h.keyword=a.get("keyword")),p(h)}n.from=0,n.rows=_?20:n.rows,n.sale_kind_cd=g,await S({...n}),l(o)}}}),e.jsxs(Ye,{children:[e.jsxs("div",{className:"count-box",children:[D.totalTitle[t],e.jsxs("em",{children:[c==null?void 0:c.totalCount," ",t==="ko"&&"ê±´"]})]}),e.jsx("div",{className:"search-box auction-list_filter_search",children:e.jsxs("form",{name:"pageForm",onSubmit:async o=>{await M(),o.preventDefault()},children:[e.jsx("i",{className:"icon_auction-search",onClick:M}),e.jsx("input",{type:"search",className:"h42",placeholder:D.searchTitle[t],ref:f}),d&&e.jsx("button",{className:"btn-reset_bubble",onClick:R,type:"button"})]})})]}),e.jsx(He,{children:(P=c==null?void 0:c.auctionList)==null?void 0:P.map(o=>{var C;const g=`${F}${o.LOT_IMG_PATH}/${o.LOT_IMG_NAME}`,h=`${F}${o.SALE_IMG_PATH}/${o.SALE_IMG_NAME}`,T="/images/bg/auction_thumbnail_current_new.png",L=K=>{K.currentTarget.src=T},J=K=>{K.currentTarget.src=T};return e.jsxs(Fe,{children:[e.jsx("figure",{className:"image-area",children:e.jsx("a",{children:!o.SALE_IMG_PATH&&!o.SALE_IMG_NAME&&o.LOT_IMG_PATH&&o.LOT_IMG_NAME?e.jsx("img",{src:g,loading:"lazy",onError:J}):o.SALE_IMG_PATH&&o.SALE_IMG_NAME?e.jsx("img",{src:h,loading:"lazy",onError:L}):e.jsx("img",{src:T,loading:"lazy"})})}),e.jsxs("div",{className:"description",children:[e.jsx("h3",{className:"title",children:B(o.SALE_TH,t)+" "+o.TITLE[t]}),e.jsx("div",{className:"info-box",children:e.jsxs("div",{className:"info",children:[e.jsx("dl",{className:"time",children:e.jsx("dd",{children:o.TO_DT[t]})}),e.jsx("dl",{className:"place",children:e.jsx("dd",{children:(C=o.PLACE)==null?void 0:C[t]})})]})})]}),e.jsx("button",{className:"btn_go-result",onClick:()=>G(o),children:D.showResultTitle[t]})]},o.SALE_NO)})}),_&&e.jsx("div",{ref:w,style:{height:"10px"}}),!_&&e.jsx(ge,{totalCount:(c==null?void 0:c.totalCount)??0,from:n.from,rows:n.rows,onChangePage:U}),(c==null?void 0:c.totalCount)===0&&e.jsxs(Ge,{children:[e.jsx("img",{src:"/images/mobile/auction/symbol-none_data.png",alt:"ê²ìê²°ê³¼ê° ììµëë¤."}),e.jsx("h2",{children:D.searchResultTitle[t]}),e.jsx("p",{children:D.searchResultDesc[t]})]})]})]})}const Ke=ue(),Ve=O(),We=new oe;re.createRoot(document.getElementById("contents")).render(e.jsx(le,{store:Ke,children:e.jsx(ce,{client:We,children:e.jsx(ae,{children:e.jsx(de,{settings:{locale:Ve},children:e.jsx(fe,{basename:"/auction-list",children:e.jsxs(me,{children:[e.jsx($,{path:"/progress",element:e.jsx(ke,{})}),e.jsx($,{path:"/upcoming",element:e.jsx(Le,{})}),e.jsx($,{path:"/upcoming/:id",element:e.jsx(Pe,{})}),e.jsx($,{path:"/results",element:e.jsx(Je,{})})]})})})})})}));
