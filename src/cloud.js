import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://trbuugoxpnohjrupnljz.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_y4LVCj887dnuzeH9mI2gyg_sY6LBg2r',
  { auth: { storageKey: 'notes.supabase.session' } },
);
const BINDING = 'notes.device.owner';
const bucket = supabase.storage.from('notes-assets');

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

function profile(user) {
  return { id: user.id, email: user.email, name: user.user_metadata?.name || '' };
}

function checkEmail(email) {
  const binding = JSON.parse(localStorage.getItem(BINDING) || 'null');
  if (binding && binding.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error('Este navegador ya está vinculado a otra cuenta de Notes. Usa otro perfil de navegador.');
  }
}

export async function notesApi(path, { method = 'GET', body } = {}, owner) {
  if (path === '/config') return Response.json({});
  if (path === '/google' || (path === '/me' && method === 'DELETE')) {
    throw new Error('Esta opción no está disponible en Notes.');
  }
  if (path === '/signup' || path === '/login') {
    checkEmail(body.email);
    const credentials = { email: body.email.trim(), password: body.password };
    const result = path === '/signup'
      ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: location.origin + location.pathname, data: { name: body.name } } })
      : await supabase.auth.signInWithPassword(credentials);
    const { user, session } = unwrap(result);
    if (!session) throw new Error('Revisa el correo de confirmación y luego inicia sesión en Notes.');
    const binding = JSON.parse(localStorage.getItem(BINDING) || 'null');
    if (binding && binding.id !== user.id) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error('Esta copia local está vinculada a otra cuenta.');
    }
    localStorage.setItem(BINDING, JSON.stringify({ id: user.id, email: user.email }));
    return Response.json({ user: profile(user) });
  }
  if (path === '/logout') {
    unwrap(await supabase.auth.signOut({ scope: 'local' }));
    return new Response(null, { status: 204 });
  }
  const { session } = unwrap(await supabase.auth.getSession());
  if (!owner || session?.user.id !== owner) {
    throw new Error('Vuelve a iniciar sesión desde el menú de cuenta.');
  }
  if (path === '/me' && method === 'PATCH') {
    return Response.json({ user: profile(unwrap(await supabase.auth.updateUser({ data: { name: body.name } })).user) });
  }
  if (path.startsWith('/changes?')) {
    const since = Number(new URLSearchParams(path.split('?')[1]).get('since')) || 0;
    const items = unwrap(await supabase.from('notes_sync_items')
      .select('id,kind,updated,deleted,data,body_key,seq')
      .eq('owner', owner).gt('seq', since).order('seq').limit(200));
    return Response.json({ items, cursor: items.at(-1)?.seq ?? since, more: items.length === 200 });
  }
  if (path === '/items') {
    const accepted = unwrap(await supabase.rpc('notes_push', { batch: body.items }));
    return Response.json({ accepted });
  }
  if (path === '/blobs/missing') {
    const missing = [];
    for (let index = 0; index < body.keys.length; index += 8) {
      await Promise.all(body.keys.slice(index, index + 8).map(async (key) => {
        const { data, error } = await bucket.exists(owner + '/' + key);
        if (error && ![400, 404].includes(Number(error.status ?? error.statusCode))) throw error;
        if (!data) missing.push(key);
      }));
    }
    return Response.json({ missing });
  }
  if (path.startsWith('/blob/')) {
    const key = path.slice(6);
    if (!/^[ab]_[A-Za-z0-9_-]+$/.test(key)) throw new Error('Identificador de archivo inválido.');
    const target = owner + '/' + key;
    if (method === 'PUT') {
      const { error } = await bucket.upload(target, body, { upsert: false, contentType: body.type || 'application/octet-stream' });
      if (error && Number(error.statusCode ?? error.status) !== 409) throw error;
      return new Response(null, { status: 204 });
    }
    return new Response(unwrap(await bucket.download(target)));
  }
  throw new Error('Operación desconocida.');
}
