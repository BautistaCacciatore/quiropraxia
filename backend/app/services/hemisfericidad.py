"""
Examen de hemisfericidad (checklist neurológico de lateralidad).

Esto es una réplica exacta de las fórmulas de la hoja "Evaluación
Hemisfericidad" del Excel del médico. Cada prueba marca "derecha",
"izquierda" o "normal", y según el tipo de prueba, ese hallazgo suma
a un lado u otro de Corteza, Cerebelo o Tallo cerebral.

Tipos de mapeo (ver columna "Estructura Afectada" del Excel original):
- ipsi_corteza:              el lado marcado suma a Corteza de ESE lado
- contra_corteza:            el lado marcado suma a Corteza del lado OPUESTO
- ipsi_tallo:                el lado marcado suma a Tallo de ESE lado
- ipsi_cerebelo:             el lado marcado suma a Cerebelo de ESE lado
- ipsi_corteza_tallo:        el lado marcado suma a Corteza Y Tallo de ESE lado
- ipsi_cerebelo_extra_tallo_izq: Cerebelo de ese lado, y si es java "izquierda"
  también suma Tallo Izquierdo (así está el Excel original: Rhomberg y
  Parado en una pierna tienen ese aporte extra solo del lado izquierdo).
"""

TESTS = [
    {"key": "tono_muscular_disminuido", "nombre": "Tono Muscular Global: Disminuido", "tipo": "ipsi_corteza_tallo"},
    {"key": "tono_muscular_aumentado", "nombre": "Tono Muscular Flex Ant T6-S, Post T6-I: Aumentado", "tipo": "ipsi_corteza_tallo"},
    {"key": "pincer_test", "nombre": "Pincer Test: No normal", "tipo": "contra_corteza"},
    {"key": "fuerza_extensores", "nombre": "Fuerza de extensores extremidad alta: Debilidad", "tipo": "contra_corteza"},
    {"key": "balanceo_brazos", "nombre": "Balanceo de brazos al caminar: Reducido", "tipo": "contra_corteza"},
    {"key": "inclinacion_cabeza", "nombre": "Inclinación de la Cabeza", "tipo": "ipsi_corteza"},
    {"key": "sacadas", "nombre": "Sácadas: No normal", "tipo": "contra_corteza"},
    {"key": "opk", "nombre": "OPK: No normal", "tipo": "ipsi_corteza"},
    {"key": "persecuciones", "nombre": "Persecuciones: No normal", "tipo": "ipsi_corteza"},
    {"key": "saturacion_roja", "nombre": "Saturación Roja", "tipo": "ipsi_tallo"},
    {"key": "espasmo_convergencia", "nombre": "Espasmo en Convergencia", "tipo": "ipsi_tallo"},
    {"key": "pupila", "nombre": "Pupila más grande / Pupila fatigada", "tipo": "ipsi_tallo"},
    {"key": "pulso_oximetria", "nombre": "Pulso/Ox (Alto/Bajo)", "tipo": "ipsi_tallo"},
    {"key": "paladar_blando", "nombre": "Paladar blando bajo", "tipo": "ipsi_tallo"},
    {"key": "desviacion_lengua", "nombre": "Desviación de Lengua", "tipo": "ipsi_tallo"},
    {"key": "dolor_un_lado", "nombre": "Dolor en un solo lado de cuerpo", "tipo": "ipsi_tallo"},
    {"key": "rhomberg", "nombre": "Rhomberg - Pulsación lateral", "tipo": "ipsi_cerebelo_extra_tallo_izq"},
    {"key": "parado_una_pierna", "nombre": "Parado en una Pierna", "tipo": "ipsi_cerebelo_extra_tallo_izq"},
    {"key": "fakuda_step", "nombre": "Fakuda Step - Desviación Lateral", "tipo": "ipsi_cerebelo"},
    {"key": "dedo_nariz", "nombre": "Dedo a la Nariz (Eficiencia)", "tipo": "ipsi_cerebelo"},
    {"key": "mapa_punto_ciego", "nombre": "Mapa de Punto Ciego - Grande", "tipo": "contra_corteza"},
]


def listar_pruebas() -> list[dict]:
    """Devuelve solo key + nombre, para que el frontend arme el formulario."""
    return [{"key": p["key"], "nombre": p["nombre"]} for p in TESTS]


def calcular_resultado(respuestas: dict) -> dict:
    """
    respuestas: {"tono_muscular_disminuido": "derecha", "rhomberg": "izquierda", ...}
    (claves ausentes o con valor "normal" no suman nada)
    """
    totales = {
        "corteza_derecha": 0,
        "corteza_izquierda": 0,
        "cerebelo_derecho": 0,
        "cerebelo_izquierdo": 0,
        "tallo_derecho": 0,
        "tallo_izquierdo": 0,
    }

    for prueba in TESTS:
        valor = (respuestas or {}).get(prueba["key"])
        if valor not in ("derecha", "izquierda"):
            continue

        tipo = prueba["tipo"]

        if tipo == "ipsi_corteza_tallo":
            if valor == "derecha":
                totales["corteza_derecha"] += 1
                totales["tallo_derecho"] += 1
            else:
                totales["corteza_izquierda"] += 1
                totales["tallo_izquierdo"] += 1

        elif tipo == "contra_corteza":
            if valor == "derecha":
                totales["corteza_izquierda"] += 1
            else:
                totales["corteza_derecha"] += 1

        elif tipo == "ipsi_corteza":
            if valor == "derecha":
                totales["corteza_derecha"] += 1
            else:
                totales["corteza_izquierda"] += 1

        elif tipo == "ipsi_tallo":
            if valor == "derecha":
                totales["tallo_derecho"] += 1
            else:
                totales["tallo_izquierdo"] += 1

        elif tipo == "ipsi_cerebelo":
            if valor == "derecha":
                totales["cerebelo_derecho"] += 1
            else:
                totales["cerebelo_izquierdo"] += 1

        elif tipo == "ipsi_cerebelo_extra_tallo_izq":
            if valor == "derecha":
                totales["cerebelo_derecho"] += 1
            else:
                totales["cerebelo_izquierdo"] += 1
                totales["tallo_izquierdo"] += 1  # réplica exacta del Excel original

    cd, ci = totales["corteza_derecha"], totales["corteza_izquierda"]
    hd, hi = totales["cerebelo_derecho"], totales["cerebelo_izquierdo"]
    td, ti = totales["tallo_derecho"], totales["tallo_izquierdo"]

    if cd != ci:
        lado_ajuste = "Contralateral"
    else:
        # Réplica exacta de la fórmula IF(OR(...)) de la celda F20 del Excel.
        es_ipsilateral = (
            hd > hi
            or td > ti
            or (hd + td) < (hi + ti)
            or (hd + td) > ti
            or (hi + ti) > hd
        )
        lado_ajuste = "Ipsilateral" if es_ipsilateral else "Balanceado"

    return {**totales, "lado_ajuste": lado_ajuste}