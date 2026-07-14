import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, ShieldQuestion } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { ImageUploader } from '../../components/shared/ImageUploader';
import { useCreateReport } from '../../hooks/queries';
import { locationService } from '../../services';
import { useAuthStore } from '../../store/auth';
import type { ReportCategory } from '../../types';

const schema = z.object({
  category: z.enum(['theft', 'violence', 'fraud', 'missing_person', 'suspicious_activity', 'other']),
  description: z.string().min(10, 'Describe what happened (min 10 chars)'),
  location: z.string().optional(),
  report_date: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const categories: { value: ReportCategory; label: string }[] = [
  { value: 'theft', label: 'Theft' },
  { value: 'violence', label: 'Violence' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'missing_person', label: 'Missing Person' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'other', label: 'Other' },
];

export function ReportCreatePage() {
  const navigate = useNavigate();
  const create = useCreateReport();
  const session = useAuthStore((s) => s.session);
  const [photo, setPhoto] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(!session);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'suspicious_activity', report_date: new Date().toISOString().slice(0, 10) },
  });

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await locationService.getCurrent();
      setLat(pos.coords.latitude);
      setLon(pos.coords.longitude);
      const name = await locationService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setValue('location', name);
    } catch {
      /* ignore */
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync({
      category: data.category,
      description: data.description,
      photo_url: photo,
      location: data.location || null,
      latitude: lat,
      longitude: lon,
      report_date: data.report_date || null,
      is_anonymous: anonymous,
      created_by: anonymous ? null : undefined,
    });
    navigate('/app/reports');
  };

  return (
    <div className="page-pad py-4 space-y-4 pb-6">
      <h1 className="text-xl font-bold text-primary">Report an Incident</h1>

      {!session && (
        <div className="card p-3 bg-warning-50 border-warning-200 flex gap-2">
          <ShieldQuestion size={18} className="text-warning-700 shrink-0 mt-0.5" />
          <p className="text-xs text-warning-800">
            You're not signed in. You can submit this report anonymously, or{' '}
            <button onClick={() => navigate('/login')} className="font-semibold underline">sign in</button> to track it.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select id="category" label="Category" error={errors.category?.message} {...register('category')}>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </Select>

        <Textarea
          id="description"
          label="What happened?"
          placeholder="Describe the incident in detail…"
          error={errors.description?.message}
          {...register('description')}
        />

        <ImageUploader value={photo} onChange={setPhoto} label="Photo evidence" aspect="square" />

        <div>
          <Input id="location" label="Location" placeholder="Where did it happen?" {...register('location')} />
          <button type="button" onClick={useMyLocation} className="mt-2 text-xs text-secondary font-medium flex items-center gap-1">
            {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />} Use my current location
          </button>
        </div>

        <Input id="report_date" type="date" label="Date of incident" {...register('report_date')} />

        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="rounded border-surface-border text-secondary focus:ring-secondary"
          />
          Submit anonymously
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="emergency" className="flex-1" disabled={create.isPending}>
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Submit report
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
