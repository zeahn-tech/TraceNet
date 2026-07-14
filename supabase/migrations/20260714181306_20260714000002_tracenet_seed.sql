/*
# TraceNet — Seed Data

## Purpose
Populates the platform with realistic demo records so the UI has content on first load: missing persons, wanted persons, crime reports, alerts, and comments. No user accounts are created (auth.users is managed by Supabase Auth); created_by is left null for seed rows.

## Notes
1. Idempotent — uses ON CONFLICT DO NOTHING on a fixed id, so re-running is safe.
2. Photos use Pexels stock URLs (publicly hosted).
3. Coordinates are realistic (US / UK cities).
*/

-- Missing persons
insert into public.missing_persons (id, full_name, photo_url, age, gender, physical_description, last_seen_location, latitude, longitude, last_seen_date, contact_information, status) values
('11111111-0000-0000-0000-000000000001', 'Amelia Brooks', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', 14, 'Female', 'Brown hair, hazel eyes, 5ft 4in, last seen wearing a navy hoodie and jeans.', 'Riverside Park, Chicago, IL', 41.9472, -87.6557, '2026-06-30', 'Contact: Chicago PD Missing Persons Unit (312) 555-0182', 'missing'),
('11111111-0000-0000-0000-000000000002', 'Daniel Reyes', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600', 17, 'Male', 'Black hair, brown eyes, 5ft 9in, wearing a grey t-shirt and black backpack.', 'Downtown Bus Terminal, Austin, TX', 30.2672, -97.7431, '2026-07-02', 'Contact: Austin PD (512) 555-0144', 'missing'),
('11111111-0000-0000-0000-000000000003', 'Maya Thompson', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600', 9, 'Female', 'Blonde hair, blue eyes, 4ft 6in, pink raincoat.', 'Greenwood Elementary, Seattle, WA', 47.6062, -122.3321, '2026-07-10', 'Contact: Seattle PD (206) 555-0177', 'located'),
('11111111-0000-0000-0000-000000000004', 'Henry Carter', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600', 72, 'Male', 'Grey hair, glasses, 5ft 10in, uses a wooden cane.', 'Oak Street, Boston, MA', 42.3601, -71.0589, '2026-05-21', 'Contact: Boston PD (617) 555-0190', 'closed')
on conflict (id) do nothing;

-- Wanted persons
insert into public.wanted_persons (id, name, photo_url, charges, description, last_known_location, agency, reward, status) values
('22222222-0000-0000-0000-000000000001', 'Marcus Webb', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600', 'Armed robbery, aggravated assault', 'Considered armed and dangerous. Do not approach. Last seen driving a dark sedan.', 'Miami, FL area', 'FBI Miami Field Office', 25000, 'active'),
('22222222-0000-0000-0000-000000000002', 'Tanya Cole', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=600', 'Wire fraud, identity theft', 'Known to use multiple aliases. Operates across state lines.', 'Phoenix, AZ area', 'US Secret Service', 10000, 'active'),
('22222222-0000-0000-0000-000000000003', 'Derek Sloan', 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=600', 'Drug trafficking, conspiracy', 'Linked to a regional distribution network.', 'Houston, TX area', 'DEA Houston', 50000, 'captured')
on conflict (id) do nothing;

-- Crime reports
insert into public.crime_reports (id, category, description, photo_url, location, latitude, longitude, report_date, status, is_anonymous) values
('33333333-0000-0000-0000-000000000001', 'theft', 'Bicycle stolen from the rack outside the library between 2pm and 4pm. Blue mountain bike, black saddle.', 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=600', 'Central Library, Portland, OR', 45.5231, -122.6765, '2026-07-11', 'verified', false),
('33333333-0000-0000-0000-000000000002', 'suspicious_activity', 'Unknown individual was photographing the rear entrance of the substation at night. Left in a white van.', null, 'Substation 4, Denver, CO', 39.7392, -104.9903, '2026-07-12', 'pending_review', true),
('33333333-0000-0000-0000-000000000003', 'fraud', 'Received a phone call claiming to be from the IRS demanding gift card payment. Reported to FTC.', null, 'Phone scam - nationwide', null, null, '2026-07-09', 'resolved', true),
('33333333-0000-0000-0000-000000000004', 'violence', 'Altercation at the 3rd Street bus stop around 11pm. One person fled on foot.', 'https://images.pexels.com/photos/2660/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600', '3rd Street, San Diego, CA', 32.7157, -117.1611, '2026-07-13', 'submitted', false)
on conflict (id) do nothing;

-- Alerts
insert into public.alerts (id, title, message, type, priority, region, expires_at) values
('44444444-0000-0000-0000-000000000001', 'Severe Weather Warning', 'Flash flood watch in effect for the tri-county area until 10pm. Avoid low-lying roads.', 'emergency', 'high', 'Tri-County Area', '2026-07-14T22:00:00Z'),
('44444444-0000-0000-0000-000000000002', 'Missing Child: Amber Alert', 'Amber Alert issued for Amelia Brooks, last seen at Riverside Park. If you have information call 911.', 'case_update', 'critical', 'Chicago, IL', '2026-07-16T00:00:00Z'),
('44444444-0000-0000-0000-000000000003', 'Community Safety Notice', 'Increased patrols in the downtown area following recent reports. Stay alert and report suspicious activity.', 'crime_warning', 'medium', 'Downtown', null),
('44444444-0000-0000-0000-000000000004', 'Public Notice: Road Closure', 'Main Street closed between 5th and 8th for the community safety fair on Saturday.', 'public_notice', 'low', 'Main Street', '2026-07-19T20:00:00Z')
on conflict (id) do nothing;

-- Comments / sightings
insert into public.comments (entity_type, entity_id, body, is_anonymous) values
('missing_person', '11111111-0000-0000-0000-000000000001', 'I think I saw someone matching this description near the park entrance around 6pm yesterday.', true),
('missing_person', '11111111-0000-0000-0000-000000000001', 'Sharing this on local community groups. Praying for her safe return.', false),
('wanted_person', '22222222-0000-0000-0000-000000000001', 'Saw a dark sedan matching the description at a gas station on US-1.', true),
('report', '33333333-0000-0000-0000-000000000001', 'My bike was taken from the same rack last month. Might be the same person.', false)
on conflict (id) do nothing;
