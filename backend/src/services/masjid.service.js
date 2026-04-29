const Masjid = require("../models/Masjid");

class MasjidService {
  static toRad(value) {
    return (value * Math.PI) / 180;
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  static formatDistance(distance) {
    return distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(1)} km`;
  }

  static async getNearestMasjids(userLat, userLng, limit = 5) {
    const masjids = await Masjid.findAll();

    let result = masjids.map((m) => {
      if (!m.latitude || !m.longitude) return null;

      const distance = this.calculateDistance(
        userLat,
        userLng,
        m.latitude,
        m.longitude
      );

      return {
        masjid_id: m.masjid_id,
        nama_masjid: m.nama_masjid,
        alamat: m.alamat,
        latitude: m.latitude,
        longitude: m.longitude,

        distance_km: Number(distance.toFixed(2)),
        distance_label: this.formatDistance(distance),
      };
    });

    result = result.filter((m) => m !== null);

    result.sort((a, b) => a.distance_km - b.distance_km);

    return result.slice(0, limit);
  }
}

module.exports = MasjidService;