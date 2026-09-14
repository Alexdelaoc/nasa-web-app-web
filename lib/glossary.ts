export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
}

/**
 * Editorial content, not NASA data: it lives here rather than behind the API.
 * Every entry is referenced from somewhere in the interface — if a term stops
 * appearing, remove it instead of leaving it as decoration.
 */
export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "ua",
    term: "Unidad astronómica",
    definition:
      "La distancia media entre la Tierra y el Sol: 149.597.870,7 km. Es la vara de medir del sistema solar, porque expresar estas distancias en kilómetros da cifras incómodas de leer.",
  },
  {
    id: "distancia-lunar",
    term: "Distancia lunar",
    definition:
      "384.400 km, la distancia media de la Tierra a la Luna. Para aproximaciones cercanas resulta mucho más intuitiva que la unidad astronómica: decir que un objeto pasa a 0,8 distancias lunares deja claro al instante que pasa por dentro de la órbita de la Luna.",
  },
  {
    id: "moid",
    term: "MOID",
    definition:
      "Distancia mínima de intersección orbital: lo más cerca que pueden llegar a estar dos órbitas, independientemente de dónde se encuentren los cuerpos en ese momento. Es el primer filtro para saber si un objeto puede suponer un riesgo algún día.",
  },
  {
    id: "magnitud-h",
    term: "Magnitud absoluta",
    definition:
      "El brillo que tendría el objeto visto a una distancia estándar. Funciona al revés de lo que parece: cuanto mayor es el número, más débil y por tanto más pequeño es el objeto. Un valor de 29 corresponde a unos pocos metros; uno de 10, a decenas de kilómetros.",
  },
  {
    id: "neo",
    term: "Objeto próximo a la Tierra",
    definition:
      "Cuerpo menor cuya órbita lo acerca a menos de 1,3 unidades astronómicas del Sol, lo que lo pone en la vecindad de la Tierra. Hay más de 42.000 catalogados y se descubren varios cada semana.",
  },
  {
    id: "pha",
    term: "Objeto potencialmente peligroso",
    definition:
      "Un objeto próximo a la Tierra con un MOID menor de 0,05 unidades astronómicas y una magnitud absoluta por debajo de 22, es decir, lo bastante grande como para causar daños si llegara a impactar. «Potencialmente» se refiere a la geometría de la órbita, no a que se espere una colisión.",
  },
  {
    id: "clase-orbital",
    term: "Clase orbital",
    definition:
      "Clasifica al objeto según cómo se relaciona su órbita con la de la Tierra. Los Apolo la cruzan desde fuera, los Atón desde dentro, los Amor se acercan sin llegar a cruzarla y los Atira quedan siempre por dentro de la órbita terrestre.",
  },
  {
    id: "excentricidad",
    term: "Excentricidad",
    definition:
      "Cuánto se aparta la órbita de un círculo perfecto. Un valor de 0 es una circunferencia; cuanto más se acerca a 1, más alargada es la elipse y mayor la diferencia entre el punto más cercano y el más lejano al Sol.",
  },
  {
    id: "semieje-mayor",
    term: "Semieje mayor",
    definition:
      "La mitad del diámetro más largo de la elipse orbital, equivalente a la distancia media del objeto al Sol. Determina por sí solo el período orbital.",
  },
  {
    id: "perihelio",
    term: "Perihelio",
    definition:
      "El punto de la órbita más cercano al Sol, y la distancia a la que ocurre. Su opuesto es el afelio, el punto más lejano.",
  },
  {
    id: "afelio",
    term: "Afelio",
    definition:
      "El punto de la órbita más alejado del Sol. Junto con el perihelio delimita el recorrido del objeto.",
  },
  {
    id: "inclinacion",
    term: "Inclinación",
    definition:
      "El ángulo entre el plano de la órbita del objeto y el plano de la órbita de la Tierra. Una inclinación de 0° significa que ambos orbitan en el mismo plano.",
  },
  {
    id: "nodo-ascendente",
    term: "Longitud del nodo ascendente",
    definition:
      "Indica por dónde la órbita del objeto cruza el plano de la Tierra de sur a norte. Junto con la inclinación fija la orientación del plano orbital en el espacio.",
  },
  {
    id: "argumento-del-perihelio",
    term: "Argumento del perihelio",
    definition:
      "Dice hacia dónde apunta la elipse dentro de su plano: el ángulo entre el nodo ascendente y el punto de máxima cercanía al Sol.",
  },
  {
    id: "anomalia-media",
    term: "Anomalía media",
    definition:
      "Dónde se encontraba el objeto a lo largo de su órbita en el instante de referencia. Es el dato que, combinado con los demás, permite calcular su posición en cualquier otra fecha.",
  },
  {
    id: "epoca",
    term: "Época",
    definition:
      "El instante al que están referidos los elementos orbitales, expresado en días julianos. Sin ella los elementos no sirven para calcular ninguna posición, porque no se sabría desde cuándo contar.",
  },
  {
    id: "albedo",
    term: "Albedo",
    definition:
      "La fracción de luz que refleja la superficie del objeto. Un albedo de 0,25 significa que devuelve una cuarta parte de la luz que recibe; los cuerpos más oscuros bajan de 0,05.",
  },
  {
    id: "arco-de-observacion",
    term: "Arco de observación",
    definition:
      "El tiempo transcurrido entre la primera y la última observación del objeto. Cuanto más largo es el arco, más fiable es la órbita calculada: con solo unos días de arco, las predicciones a años vista son muy inciertas.",
  },
];

const BY_ID = new Map(GLOSSARY.map((entry) => [entry.id, entry]));

export function glossaryEntry(id: string): GlossaryEntry | undefined {
  return BY_ID.get(id);
}
