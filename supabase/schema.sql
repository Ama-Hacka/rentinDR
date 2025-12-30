CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  rooms INTEGER NOT NULL CHECK (rooms > 0),
  square_meters INTEGER NOT NULL CHECK (square_meters > 0),
  pets_allowed BOOLEAN DEFAULT FALSE,
  negotiable_items TEXT[],
  source_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive','rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_rooms ON public.properties(rooms);
CREATE INDEX idx_properties_status ON public.properties(status);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active" ON public.properties FOR SELECT USING (status = 'active');
-- Replace owner policies to enforce role='owner'
DROP POLICY IF EXISTS "Owners manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Owners update their properties" ON public.properties;
DROP POLICY IF EXISTS "Owners delete their properties" ON public.properties;

CREATE POLICY "Owners insert (role=owner)" ON public.properties
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data ->> 'role') = 'owner'
    )
  );

CREATE POLICY "Owners update (role=owner)" ON public.properties
  FOR UPDATE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data ->> 'role') = 'owner'
    )
  )
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data ->> 'role') = 'owner'
    )
  );

CREATE POLICY "Owners delete (role=owner)" ON public.properties
  FOR DELETE
  USING (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data ->> 'role') = 'owner'
    )
  );

CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images" ON public.property_images FOR SELECT USING (true);
CREATE POLICY "Owners add images" ON public.property_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners update/delete images" ON public.property_images FOR UPDATE USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners delete images" ON public.property_images FOR DELETE USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));

CREATE TABLE public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_property_amenities_property_id ON public.property_amenities(property_id);
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view amenities" ON public.property_amenities FOR SELECT USING (true);
CREATE POLICY "Owners manage amenities" ON public.property_amenities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners update/delete amenities" ON public.property_amenities FOR UPDATE USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));
CREATE POLICY "Owners delete amenities" ON public.property_amenities FOR DELETE USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid()));

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, property_id)
);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.favorites(property_id);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (user_id = auth.uid());
