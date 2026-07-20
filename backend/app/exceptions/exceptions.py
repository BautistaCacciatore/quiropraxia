"""
Excepciones propias del negocio. Separarlas de excepciones genéricas
de Python permite capturarlas específicamente y, a futuro, mapearlas
a códigos de error HTTP claros cuando exista una API.
"""


class PacienteYaExiste(Exception):
    """Se lanza al intentar registrar un DNI que ya existe."""
    pass


class PacienteNoEncontrado(Exception):
    """Se lanza al buscar/modificar/eliminar un paciente inexistente."""
    pass


class DatosInvalidos(Exception):
    """Se lanza cuando se intenta actualizar con un campo inexistente o inválido."""
    pass


class CredencialesInvalidas(Exception):
    """Se lanza cuando el usuario o la contraseña no coinciden."""
    pass


class RadiografiaNoEncontrada(Exception):
    """Se lanza al buscar/eliminar una radiografía que no existe."""
    pass


class ArchivoInvalido(Exception):
    """Se lanza cuando el archivo subido no cumple el tipo o tamaño permitido."""
    pass


class SeguimientoNoEncontrado(Exception):
    """Se lanza al buscar un seguimiento inexistente."""
    pass