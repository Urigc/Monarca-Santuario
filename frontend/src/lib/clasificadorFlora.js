/**
 * Identificación por IA de flora del santuario usando la cámara
 * (Pilar 1, ANEXO1). 100% client-side y gratuito: TensorFlow.js +
 * MobileNet corren en el navegador, sin backend ni costo por llamada.
 *
 * NOTA HONESTA DE INGENIERÍA: MobileNet está entrenado sobre ImageNet,
 * que no tiene clases específicas de "oyamel" u otras especies locales.
 * Por eso el resultado es una identificación APROXIMADA: se toman las
 * predicciones genéricas del modelo (ej. "fir", "pine", "conifer") y se
 * comparan contra las `etiquetas_ia` de cada ficha en `flora_santuario`.
 * Es una compra consciente costo/beneficio: uplift real para el usuario
 * de campo sin depender de un modelo propietario o de pago.
 */
let modeloPromesa = null;

async function obtenerModelo() {
  if (!modeloPromesa) {
    const tf = await import("@tensorflow/tfjs");
    const mobilenet = await import("@tensorflow-models/mobilenet");
    await tf.ready();
    modeloPromesa = mobilenet.load({ version: 2, alpha: 1.0 });
  }
  return modeloPromesa;
}

/**
 * Clasifica una imagen (HTMLImageElement/HTMLVideoElement/canvas) y
 * devuelve la ficha de `floraCatalogo` que mejor coincide, junto con
 * las predicciones crudas del modelo para transparencia con el usuario.
 */
export async function identificarFlora(elementoImagen, floraCatalogo) {
  const modelo = await obtenerModelo();
  const predicciones = await modelo.classify(elementoImagen, 5);

  const textoPredicho = predicciones.map((p) => p.className.toLowerCase()).join(" | ");

  let mejorCoincidencia = null;
  let mejorPuntaje = 0;

  for (const ficha of floraCatalogo) {
    const etiquetas = ficha.etiquetas_ia || [];
    let puntaje = 0;
    for (const etiqueta of etiquetas) {
      if (textoPredicho.includes(etiqueta.toLowerCase())) puntaje += 1;
    }
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejorCoincidencia = ficha;
    }
  }

  return {
    coincidencia: mejorPuntaje > 0 ? mejorCoincidencia : null,
    confiable: mejorPuntaje > 0,
    prediccionesCrudas: predicciones,
  };
}
