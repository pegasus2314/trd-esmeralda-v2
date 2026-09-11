import { listAnnouncements } from "@/lib/dal/admin";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/lib/actions/admin-actions";
import { Card, Field, inputClass, EmptyState, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";

export default async function AnunciosPage() {
  const announcements = await listAnnouncements();

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl">Anuncios</h1>

      <Card className="mb-5 p-5">
        <form
          action={async (formData) => {
            "use server";
            await createAnnouncementAction(formData);
          }}
          className="grid gap-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Título">
              <input className={inputClass} name="title" required />
            </Field>
            <Field label="Publicar">
              <select className={inputClass} name="published" defaultValue="false">
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </Field>
          </div>
          <Field label="Contenido">
            <textarea className={inputClass} name="content" rows={4} required />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Crear anuncio
          </Button>
        </form>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState title="No hay anuncios." />
      ) : (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10.5px] uppercase text-muted">
                <th className="p-3">Título</th>
                <th className="p-3">Publicado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-t border-line">
                  <td className="p-3">{a.title}</td>
                  <td className="p-3">
                    <Badge tone={a.published ? "success" : "default"}>{a.published ? "Sí" : "No"}</Badge>
                  </td>
                  <td className="p-3">
                    <DeleteRowButton id={a.id} action={deleteAnnouncementAction} confirmMessage="¿Eliminar este anuncio?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
