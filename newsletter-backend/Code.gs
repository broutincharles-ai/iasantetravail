const SHEET_NAME = 'Subscribers';
const FROM_NAME = 'IA & Santé au Travail';
const SITE_URL = 'https://www.iasantetravail.com';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return json_({ok:false,error:'invalid_email'}, 400);
  const sheet = getSheet_();
  const token = Utilities.getUuid() + Utilities.getUuid();
  sheet.appendRow([new Date(), email, 'pending', token, payload.locale || 'fr', payload.source || '', '']);
  const confirmUrl = ScriptApp.getService().getUrl() + '?action=confirm&token=' + encodeURIComponent(token);
  MailApp.sendEmail({to:email,name:FROM_NAME,subject:'Confirmez votre inscription',htmlBody:`<p>Bonjour,</p><p>Confirmez votre inscription aux mises à jour de IA & Santé au Travail :</p><p><a href="${confirmUrl}">Confirmer mon inscription</a></p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>`});
  return json_({ok:true});
}
function doGet(e) {
  const action=e.parameter.action, token=e.parameter.token;
  const sheet=getSheet_(), values=sheet.getDataRange().getValues();
  for(let i=1;i<values.length;i++){
    if(values[i][3]===token){
      if(action==='confirm'){sheet.getRange(i+1,3).setValue('confirmed');sheet.getRange(i+1,7).setValue(new Date());return HtmlService.createHtmlOutput('<h1>Inscription confirmée</h1><p>Merci. Vous pouvez fermer cette page.</p>');}
      if(action==='unsubscribe'){sheet.getRange(i+1,3).setValue('unsubscribed');return HtmlService.createHtmlOutput('<h1>Désinscription enregistrée</h1>');}
    }
  }
  return HtmlService.createHtmlOutput('<h1>Lien invalide ou expiré</h1>');
}
function getSheet_(){const ss=SpreadsheetApp.getActive();let sh=ss.getSheetByName(SHEET_NAME);if(!sh){sh=ss.insertSheet(SHEET_NAME);sh.appendRow(['requested_at','email','status','token','locale','source','confirmed_at']);}return sh;}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
