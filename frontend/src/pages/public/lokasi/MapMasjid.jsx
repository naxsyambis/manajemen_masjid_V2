import React, { useEffect, useState } from "react";
import NavbarPublic from "../../../components/NavbarPublic";
import FooterPublic from "../../../components/FooterPublic";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16);
  }, [position]);
  return null;
};

const MapMasjid = () => {
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [nearestMasjids, setNearestMasjids] = useState([]);
  const [allMasjids, setAllMasjids] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPos, setSelectedPos] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([
          pos.coords.latitude,
          pos.coords.longitude,
        ]);
      },
      () => alert("Aktifkan izin lokasi")
    );
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    fetch(
      `http://localhost:3000/public/masjid/nearest?latitude=${userLocation[0]}&longitude=${userLocation[1]}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setNearestMasjids(res.data);
      });
  }, [userLocation]);

  useEffect(() => {
    fetch("http://localhost:3000/public/masjid")
      .then((res) => res.json())
      .then((res) => setAllMasjids(res.data || res));
  }, []);

  const filteredMasjids =
    search.length > 0
      ? allMasjids.filter((m) =>
          m.nama_masjid.toLowerCase().includes(search.toLowerCase())
        )
      : nearestMasjids;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <NavbarPublic />

      <main className="pt-24 px-6 pb-10">

        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase">
            Peta <span className="text-mu-green">Masjid</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">
            Sistem lokasi masjid terintegrasi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 h-[calc(100vh-160px)] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative z-0">

            {userLocation && (
              <MapContainer
                center={userLocation}
                zoom={14}
                className="h-full w-full"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={userLocation}>
                  <Popup>Lokasi Anda</Popup>
                </Marker>

                {selectedPos && (
                  <FlyToLocation position={selectedPos} />
                )}

                {filteredMasjids.map((m) => (
                  <Marker
                    key={m.masjid_id}
                    position={[+m.latitude, +m.longitude]}
                  >
                    <Popup>
                      <strong>{m.nama_masjid}</strong>
                      <br />
                      {m.alamat}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          <div className="h-[calc(100vh-160px)] bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col">
            <input
              type="text"
              placeholder="Cari masjid"
              className="w-full px-4 py-3 text-sm bg-gray-100 rounded-xl focus:ring-2 focus:ring-mu-green outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mt-6 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {search ? "Hasil Pencarian" : "Masjid Terdekat"}
              </p>

              <p className="text-lg font-black text-gray-800">
                {filteredMasjids.length} Masjid
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">

              {filteredMasjids.map((m) => {
                const lat = +m.latitude;
                const lng = +m.longitude;

                return (
                  <div
                    key={m.masjid_id}
                    onClick={() => setSelectedPos([lat, lng])}
                    className="relative p-6 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <h3 className="text-sm font-black text-gray-800">
                      {m.nama_masjid}
                    </h3>

                    <p className="text-[11px] text-gray-400 mt-1">
                      {m.alamat}
                    </p>

                    {m.distance_label && (
                      <p className="text-[11px] text-mu-green mt-2 font-bold">
                        {m.distance_label}
                      </p>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/masjid/${m.masjid_id}`);
                      }}
                      className="absolute bottom-4 right-4 px-4 py-1.5 rounded-lg bg-mu-green text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition active:scale-95"
                    >
                      Detail
                    </button>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default MapMasjid;