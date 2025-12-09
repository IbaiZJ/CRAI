#!/usr/bin/env python3
"""
Generador de matrículas españolas sin espacio (NNNNLLL)
y fecha de caducidad ITV:

- Letras < M → ITV aleatoria (5% caducada / 95% vigente) hasta 12/05/2026
- Letras >= M → coches nuevos, caducidad 4 años después de matriculación
"""

import csv
import random
from datetime import date, timedelta
import argparse

# ------------ CONFIGURACIÓN ------------
ALLOWED_LETTERS = list("BCDFGHJKLMNPRSTVWXYZ")  # sin vocales, sin Ñ, sin Q
ALLOWED_FIRST = [L for L in ALLOWED_LETTERS if L <= 'N']

TARGET_PLATE = "5500NHZ"     # límite inclusive
TODAY = date(2025, 12, 5)
MAX_ITV_DATE = date(2026, 5, 12)  # máximo para coches antiguos
SERIE_M_START = date(2022, 1, 1)  # inicio serie M
SERIE_M_END = TODAY                # última matrícula conocida

# ------------ FUNCIONES AUXILIARES ------------
def plate_key(num, l1, l2, l3):
    return f"{num:04d}{l1}{l2}{l3}"

def should_be_expired(prob=0.05):
    return random.random() < prob

def random_past_date(max_years=5):
    days = random.randint(1, max_years * 365)
    return TODAY - timedelta(days=days)

def random_future_date():
    """Fecha futura aleatoria hasta MAX_ITV_DATE"""
    days = random.randint(0, (MAX_ITV_DATE - TODAY).days)
    return TODAY + timedelta(days=days)

# Calcula la distribución diaria para la serie M+
def calculate_serie_m_distribution(total_matriculas):
    total_days = (SERIE_M_END - SERIE_M_START).days + 1
    matriculas_por_dia = max(1, total_matriculas // total_days)
    return matriculas_por_dia, total_days

# ------------ GENERADOR PRINCIPAL ------------
def generate_until_target(target_plate=TARGET_PLATE, out_csv="plates_itv.csv"):

    # Contamos cuántas matrículas M+ hay para calcular distribución
    serie_m_list = []
    for l1 in ALLOWED_LETTERS:
        if l1 >= 'M':
            for l2 in ALLOWED_LETTERS:
                for l3 in ALLOWED_LETTERS:
                    for num in range(0, 10000):
                        plate = plate_key(num, l1, l2, l3)
                        serie_m_list.append(plate)
                        if plate == target_plate:
                            break
                    if plate == target_plate:
                        break
                if plate == target_plate:
                    break
            if plate == target_plate:
                break

    total_matriculas_m = len(serie_m_list)
    matriculas_por_dia, total_days = calculate_serie_m_distribution(total_matriculas_m)
    # print(total_matriculas_m, matriculas_por_dia, total_days)

    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["plate", "itv_expiry"])
        writer.writeheader()

        reached = False
        serie_m_counter = 0  # índice en serie M para asignar fecha

        for l1 in ALLOWED_FIRST + [l for l in ALLOWED_LETTERS if l >= 'M']:
            for l2 in ALLOWED_LETTERS:
                for l3 in ALLOWED_LETTERS:
                    for num in range(0, 10000):
                        plate = plate_key(num, l1, l2, l3)

                        # -------- Lógica ITV --------
                        if l1 < 'M':
                            # coches antiguos
                            if should_be_expired():
                                itv_expiry = random_past_date().isoformat()
                            else:
                                itv_date = random_future_date()
                                # nunca superar MAX_ITV_DATE
                                if itv_date > MAX_ITV_DATE:
                                    itv_date = MAX_ITV_DATE
                                itv_expiry = itv_date.isoformat()
                        else:
                            # coches nuevos M+
                            # calculamos fecha de matriculación
                            day_index = serie_m_counter // matriculas_por_dia
                            fecha_matriculacion = SERIE_M_START + timedelta(days=day_index)
                            itv_expiry = fecha_matriculacion.replace(year=fecha_matriculacion.year + 4).isoformat()
                            serie_m_counter += 1

                        writer.writerow({
                            "plate": plate,
                            "itv_expiry": itv_expiry
                        })

                        if plate == target_plate:
                            reached = True
                            break
                    if reached: break
                if reached: break
            if reached: break

    return out_csv, reached

# ------------ CLI ------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Genera matrículas españolas y fecha ITV.")
    parser.add_argument("--out", "-o", default="plates_itv.csv")
    parser.add_argument("--target", "-t", default=TARGET_PLATE)
    args = parser.parse_args()

    print("Iniciando generación...")
    out_file, finished = generate_until_target(args.target, args.out)

    if finished:
        print(f"Generación completada. Archivo: {out_file}")
    else:
        print(f"No se alcanzó la matrícula objetivo {args.target}. Archivo parcial: {out_file}")
