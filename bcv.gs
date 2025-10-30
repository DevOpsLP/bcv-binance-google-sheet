function actualizarPreciosBCV() {
  const url = "https://www.bcv.org.ve/";
  const html = UrlFetchApp.fetch(url).getContentText();

  // Nota: este selector depende del HTML del BCV y puede cambiar.
  const regex = /<div class="col-sm-6 col-xs-6 centrado"><strong>\s*([\d,\.]+)\s*<\/strong>/g;
  const matches = [...html.matchAll(regex)];

  if (matches.length < 5) {
    Logger.log("No se encontraron suficientes valores en el HTML del BCV.");
    return;
  }

  const euro = parseFloat(matches[0][1].replace(",", "."));
  const dolar = parseFloat(matches[4][1].replace(",", "."));

  const binanceUrl = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
  const body = {
    fiat: "VES",
    page: 1,
    rows: 2,
    tradeType: "BUY",
    asset: "USDT",
    countries: [],
    proMerchantAds: false,
    shieldMerchantAds: false,
    filterType: "tradable",
    periods: [],
    additionalKycVerifyFilter: 0,
    publisherType: null,
    payTypes: [],
    classifies: ["mass", "profession", "fiat_trade"],
    tradedWith: false,
    followed: false
  };

  let precioBinance = null;
  try {
    const res = UrlFetchApp.fetch(binanceUrl, {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        accept: "application/json"
      },
      payload: JSON.stringify(body)
    });

    const json = JSON.parse(res.getContentText());
    if (json && json.code === "000000" && Array.isArray(json.data) && json.data.length > 0) {
      const adv = json.data[0].adv;
      precioBinance = parseFloat(adv.price); 
    } else {
      Logger.log("Respuesta de Binance sin datos válidos: " + res.getContentText());
    }
  } catch (e) {
    Logger.log("Error consultando Binance P2P: " + e);
  }

  // ===== Escribir en la hoja // Modificar a gusto =====
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  hoja.getRange("G1").setValue("Precio EURO (BCV)");
  hoja.getRange("H1").setValue("Precio DÓLAR (BCV)");
  hoja.getRange("I1").setValue("Precio Binance");
  hoja.getRange("J1").setValue("Última Actualización");

  hoja.getRange("G2").setValue(euro);
  hoja.getRange("H2").setValue(dolar);
  if (precioBinance !== null && !isNaN(precioBinance)) {
    hoja.getRange("I2").setValue(precioBinance);
  } else {
    hoja.getRange("I2").setValue("N/D");
  }
  hoja.getRange("J2").setValue(new Date());

  // (Opcional) formatos numéricos
  hoja.getRange("G2:I2").setNumberFormat("0.000");
  hoja.getRange("J2").setNumberFormat("yyyy-MM-dd HH:mm:ss");
}
