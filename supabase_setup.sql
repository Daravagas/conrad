-- Führe diesen SQL-Befehl im SQL-Editor von Supabase aus, um die Tabelle zu erstellen

CREATE TABLE public.contact_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Sicherheitsrichtlinien (RLS) aktivieren, falls du das Formular absichern möchtest:
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Erlaube anonymen Benutzern (dem Frontend), neue Einträge hinzuzufügen:
CREATE POLICY "Allow anonymous inserts" 
ON public.contact_requests 
FOR INSERT 
TO anon 
WITH CHECK (true);
