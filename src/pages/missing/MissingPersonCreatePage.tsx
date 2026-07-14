import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { ImageUploader } from '../../components/shared/ImageUploader';
import { useCreateMissing } from '../../hooks/queries';
import { locationService } from '../../services';
import { useState } from 'react';

const schema = z.object({
  full_name: z.string().min(2, 'Required'),
  age: z.string().optional(),
  gender: z.string().optional(),
  physical_description: z.string().min(5, 'Describe the person'),
  last_seen_location: z.string().min(2, 'Required'),
  last_seen_date: z.string().optional(),
  contact_information: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function MissingPersonCreatePage() {
  const navigate = useNavigate();
  const create = useCreateMissing();
  const [photo, setPhoto] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const pos = await locationService.getCurrent();
      setLat(pos.coords.latitude);
      setLon(pos.coords.longitude);
      const name = await locationService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setValue('last_seen_location', name);
    } catch {
      /* ignore */
    } finally {
      setLocating(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    await create.mutateAsync({
      full_name: data.full_name,
      photo_url: photo,
      age: data.age ? Number(data.age) : null,
      gender: data.gender || null,
      physical_description: data.physical_description,
      last_seen_location: data.last_seen_location,
      latitude: lat,
      longitude: lon,
      last_seen_date: data.last_seen_date || null,
      contact_information: data.contact_information || null,
    });
    navigate('/app/missing');
  };

  return (
    <div className="page-pad py-4 space-y-4 pb-4">
      <h1 className="text-xl font-bold text-primary">New Missing Person Case</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ImageUploader value={photo} onChange={setPhoto} label="Photo" />
        <Input id="full_name" label="Full name" error={errors.full_name?.message} {...register('full_name')} />
        <div className="grid grid-cols-2 gap-3">
          <Input id="age" type="number" label="Age" error={errors.age?.message} {...register('age')} />
          <Select id="gender" label="Gender" {...register('gender')}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <Textarea id="physical_description" label="Physical description" error={errors.physical_description?.message} {...register('physical_description')} />
        <div>
          <Input id="last_seen_location" label="Last seen location" error={errors.last_seen_location?.message} {...register('last_seen_location')} />
          <button type="button" onClick={useMyLocation} className="mt-2 text-xs text-secondary font-medium flex items-center gap-1">
            {locating ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />} Use my current location
          </button>
        </div>
        <Input id="last_seen_date" type="date" label="Last seen date" {...register('last_seen_date')} />
        <Input id="contact_information" label="Contact information" placeholder="Phone or email" {...register('contact_information')} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" className="flex-1" disabled={create.isPending}>
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Create case
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
