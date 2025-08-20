-- Crear tabla marcas
CREATE TABLE IF NOT EXISTS marcas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    pais_origen VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    "createdById" UUID REFERENCES users(id),
    "updatedById" UUID REFERENCES users(id)
);

-- Índices para mejorar búsquedas
CREATE INDEX idx_marcas_nombre ON marcas(nombre);
CREATE INDEX idx_marcas_is_active ON marcas(is_active);