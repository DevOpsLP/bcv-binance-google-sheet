function actualizarPreciosBCV() {
  const url = "https://www.bcv.org.ve/";

  const html = UrlFetchApp.fetch(url, {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  }).getContentText();

  // =========================
  // Helpers
  // =========================
  function parseNumero(valor) {
    if (!valor) return null;

    return parseFloat(
      String(valor)
        .trim()
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  function extraerMonedaPorId(html, id) {
    const regex = new RegExp(
      `<div\\s+id="${id}"[\\s\\S]*?<strong[^>]*>\\s*([\\d.,]+)\\s*<\\/strong>`,
      "i"
    );

    const match = html.match(regex);

    if (!match) {
      Logger.log(`No se encontró la moneda con id: ${id}`);
      return null;
    }

    return parseNumero(match[1]);
  }

  // =========================
  // BCV
  // =========================
  const euro = extraerMonedaPorId(html, "euro");
  const dolar = extraerMonedaPorId(html, "dolar");

  if (euro === null || dolar === null) {
    Logger.log("No se pudieron extraer los valores de EURO o DÓLAR del BCV.");
    return;
  }

  // =========================
  // Binance P2P
  // =========================
  const binanceUrl = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

  const body = {
    "fiat": "VES",
    "page": 1,
    "rows": 10,
    "tradeType": "BUY",
    "asset": "USDT",
    "countries": [],
    "proMerchantAds": false,
    "shieldMerchantAds": false,
    "filterType": "tradable",
    "periods": [],
    "additionalKycVerifyFilter": 0,
    "publisherType": "merchant",
    "payTypes": [],
    "classifies": [
        "mass",
        "profession",
        "fiat_trade"
    ],
    "tradedWith": false,
    "followed": false
};

  let precioBinance = null;

  try {
    const res = UrlFetchApp.fetch(binanceUrl, {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      headers: {
        accept: "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      payload: JSON.stringify(body)
    });

    const raw = res.getContentText();
    const json = JSON.parse(raw);
    Logger.log(json.data[1]) ;
    if (
      json &&
      json.code === "000000" &&
      Array.isArray(json.data) &&
      json.data.length > 0
    ) {
      const anuncioValido = json.data.find(item => {
        const adv = item.adv || {};

        const esPromoted =
          item.privilegeDesc === "Promoted Ad" ||
          item.privilegeType === 8;

        const tienePrecio = adv.price && !isNaN(parseFloat(adv.price));
        return !esPromoted && tienePrecio;
      });

      if (anuncioValido) {
        precioBinance = parseFloat(anuncioValido.adv.price);
        Logger.log(precioBinance);
      } else {
        Logger.log("No se encontró ningún anuncio válido no promocionado.");
      }
    } else {
      Logger.log("Respuesta de Binance sin datos válidos: " + raw);
    }
  } catch (e) {
    Logger.log("Error consultando Binance P2P: " + e);
  }

  // =========================
  // Escribir en la hoja
  // Misma estructura original
  // =========================
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

  hoja.getRange("G2:I2").setNumberFormat("0.000");
  hoja.getRange("J2").setNumberFormat("yyyy-MM-dd HH:mm:ss");
}
