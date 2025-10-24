import React from "react";
import { SkeletonLoader } from "./SkeletonLoader";

const TodayCard = ({
  currentAirQuality,
  getColorByISPU,
  mapeResults,
  handleCardClick,
  showModal,
  selectedPollutant,
  handleCloseModal,
}) => {
  return (
    <section className="my-2 col-md-6 col-lg-6">
      <div className="row">
        {/* Card 1 */}
        <div className="card p-0">
          {/* Card Title 1 */}
          <h6 className="card-title text-start mt-3 mb-0 mx-3">
            Polutan Udara Hari Ini
          </h6>

          {/* Card Content 1 */}
          <div className="card-body mt-0">
            <div className="row">
              {Object.keys(currentAirQuality).length === 0 ? (
                <>
                  {[...Array(7)].map((_, index) => (
                    <SkeletonLoader key={index} />
                  ))}
                </>
              ) : (
                Object.keys(currentAirQuality).map((pollutant) => {
                  const airQualityData = currentAirQuality[pollutant];
                  const { prediction } = airQualityData;
                  const adjustedPrediction = prediction <= 0 ? 0 : prediction;
                  const color = getColorByISPU(prediction);
                  const mapeValue = mapeResults[pollutant];

                  return (
                    <div key={pollutant} className="col-sm-6 mb-3">
                      <div
                        className="card border-0"
                        style={{
                          backgroundColor: "#F3F5F7",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleCardClick(pollutant, airQualityData)
                        }>
                        <div
                          className="card-body text-start pb-0"
                          style={{
                            transition:
                              "transform 0.3s ease, box-shadow 0.3s ease",
                            boxShadow: "0 0px 4px rgba(0, 0, 0, 0.1)",
                            backgroundColor: "#F3F5F7",
                            borderRadius: "5px",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                            e.target.style.boxShadow =
                              "0 4px 10px rgba(0, 0, 0, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.1)";
                          }}>
                          <h6
                            className="card-title mb-0"
                            style={{ pointerEvents: "none" }}>
                            {pollutant}{" "}
                            {mapeValue && (
                              <div
                                className="badge badge-light"
                                style={{
                                  fontSize: "10px",
                                  backgroundColor: "#7e99a3",
                                  color: "#fff",
                                  padding: "2px 6px",
                                }}>
                                {mapeValue}
                              </div>
                            )}
                          </h6>
                          <div
                            className="card-text mt-1"
                            style={{ pointerEvents: "none" }}>
                            {pollutant === "CO" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Karbon Monoksida
                              </p>
                            ) : pollutant === "HC" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Hidrokarbon
                              </p>
                            ) : pollutant === "NO2" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Nitrogen Dioksida
                              </p>
                            ) : pollutant === "O3" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Ozon
                              </p>
                            ) : pollutant === "PM10" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Materi Partikulat di bawah 10 mikron
                              </p>
                            ) : pollutant === "PM25" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Partikel halus di bawah 2,5 mikron
                              </p>
                            ) : pollutant === "SO2" ? (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Sulfur Dioksida
                              </p>
                            ) : (
                              <p
                                className="text-muted"
                                style={{ fontSize: "10px" }}>
                                Polutan tidak terdefinisi
                              </p>
                            )}
                          </div>
                          <div
                            className="card-text mb-0"
                            style={{ pointerEvents: "none" }}>
                            <p
                              className="badge"
                              style={{ backgroundColor: color }}>
                              {adjustedPrediction}
                            </p>
                            <span className="ms-2" style={{ fontSize: "10px" }}>
                              µg/m³
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        {/* End of Card 1 */}

        {/* Modal Card 1 */}
        {showModal && selectedPollutant && (
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            aria-labelledby="pollutantModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div className="mt-4">
                      <h5 className="modal-title" id="pollutantModalLabel">
                        {selectedPollutant.pollutant}
                      </h5>
                      {selectedPollutant.pollutant === "CO" ? (
                        <p style={{ fontSize: "14px" }}>Karbon Monoksida</p>
                      ) : selectedPollutant.pollutant === "HC" ? (
                        <p style={{ fontSize: "14px" }}>Hidrokarbon</p>
                      ) : selectedPollutant.pollutant === "NO2" ? (
                        <p style={{ fontSize: "10px" }}>Nitrogen Dioksida</p>
                      ) : selectedPollutant.pollutant === "O3" ? (
                        <p style={{ fontSize: "14px" }}>Ozon</p>
                      ) : selectedPollutant.pollutant === "PM10" ? (
                        <p style={{ fontSize: "14px" }}>
                          Materi Partikulat di bawah 10 mikron
                        </p>
                      ) : selectedPollutant.pollutant === "PM25" ? (
                        <p style={{ fontSize: "14px" }}>
                          Partikel halus di bawah 2,5 mikron
                        </p>
                      ) : selectedPollutant.pollutant === "SO2" ? (
                        <p style={{ fontSize: "14px" }}>Sulfur Dioksida</p>
                      ) : (
                        <p className="text-muted" style={{ fontSize: "14px" }}>
                          Polutan tidak terdefinisi
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-close mt-1"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={handleCloseModal}></button>
                  </div>

                  <p className="mb-1">
                    <strong>Apa itu {selectedPollutant.pollutant} ? </strong>
                  </p>
                  <p>
                    {" "}
                    {selectedPollutant.pollutant === "CO"
                      ? "Karbon Monoksida adalah gas yang tidak berwarna, tidak berbau, dan tidak berasa, namun sangat beracun dan berbahaya bagi tubuh. CO dihasilkan oleh proses pembakaran yang tidak sempurna di dalam mesin."
                      : selectedPollutant.pollutant === "HC"
                      ? "Hidrokarbon terdiri dari unsur karbon (C) dan hidrogen (H) yang dapat kita temui pada minyak tanah, bensin, plastik, gas alam, dan lain-lain"
                      : selectedPollutant.pollutant === "NO2"
                      ? "Gas murni yang biasanya berwarna coklat kemerahan. Saat tertiup angin maka gas nitrogen dioksida akan terlihat putih dan berbau menyengat."
                      : selectedPollutant.pollutant === "O3"
                      ? "Ozon (O₃) adalah gas yang dibentuk oleh radiasi ultraviolet (sinar matahari) dan molekul oksigen. Ozon adalah senyawa alam yang berperan penting dalam menghalangi sinar UV yang berbahaya dari matahari - namun, pada dasarnya ozon adalah racun."
                      : selectedPollutant.pollutant === "SO2"
                      ? "Sulfur dioksida (SO₂) adalah gas tidak berwarna. Gas ini termasuk dalam sekelompok gas yang sangat reaktif yang dikenal sebagai 'oksida belerang'. Mereka dengan mudah bereaksi bersama untuk membentuk senyawa berbahaya seperti asam sulfat, asam belerang, dan partikel sulfat."
                      : selectedPollutant.pollutant === "PM10"
                      ? "PM10 adalah partikel di udara dengan diameter 10 mikrometer atau kurang (termasuk asap, jelaga, garam, asam, dan logam). Perbedaan antara PM10 dan PM2.5 hanya pada ukurannya - dimana PM2.5 sangat halus, sedangkan PM10 lebih besar dan kasar."
                      : selectedPollutant.pollutant === "PM25"
                      ? "PM2.5 merupakan partikel yang mengambang di udara dengan ukuran diameter 2,5 mikrometer atau kurang. Ukuran PM2.5 sangat kecil sehingga dapat diserap ke dalam aliran darah saat bernapas. Karena alasan ini, biasanya polutan ini menimbulkan ancaman kesehatan terbesar."
                      : "Deskripsi polutan lainnya..."}
                  </p>

                  <p className="mb-1">
                    <strong>
                      Dari mana {selectedPollutant.pollutant} berasal?{" "}
                    </strong>
                  </p>
                  <p className="mb-1">
                    {" "}
                    {selectedPollutant.pollutant === "CO" ? (
                      <>
                        Karbon monoksida (CO) dapat dihasilkan dari berbagai
                        sumber, di antaranya:
                        <ul>
                          <li>
                            Pembakaran bahan bakar fosil, seperti bensin, kayu,
                            arang, dan propana
                          </li>
                          <li>Kendaraan bermotor, seperti mobil dan truk</li>
                          <li>
                            Sistem pemanas, seperti tungku, oven, dan pemanas
                            air
                          </li>
                          <li>
                            Peralatan rumah tangga, seperti kompor gas dan
                            perapian
                          </li>
                          <li>Industri yang menggunakan bahan bakar fosil</li>
                          <li>Asap rokok</li>
                          <li>Penggunaan pipa shisha atau hookah</li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "HC" ? (
                      "Polutan ini dapat dihasilkan melalui pembakaran bahan bakar atau tumpahan minyak mentah dan termasuk polutan utama yang dihasilkan oleh kendaraan bermotor. Pembakaran hidrokarbon yang tidak sempurna dapat meningkatkan emisi hidrokarbon aromatik polisiklik (PAH) yang berbahaya bagi kesehatan manusia dan lingkungan (H. Zhang dkk., 2022)"
                    ) : selectedPollutant.pollutant === "NO2" ? (
                      "Polutan berbahaya seperti nitrogen dioksida banyak dihasilkan dari aktivitas kendaraan bermotor. Konsentrasi nitrogen dioksida yang dihasilkan oleh aktivitas kendaraan bermotor pada kemacetan lalu lintas dapat berubah-ubah seiring berubahnya volume kendaraan (Fahmi, 2023)."
                    ) : selectedPollutant.pollutant === "O3" ? (
                      "Di kota-kota besar seperti Bogor, konsentrasi polutan udara telah meningkat disebabkan oleh peningkatan urbanisasi dan industrialisasi. Hal tersebut menghasilkan oksida nitrogen dan senyawa organik yang mudah menguap atau hidrokarbon lalu bereaksi dengan panas dan sinar matahari sehingga membentuk ozon (O3) (Berezina dkk., 2020)."
                    ) : selectedPollutant.pollutant === "SO2" ? (
                      "Gas ini berasal dari pembakaran bahan bakar fosil yang mengandung unsur belerang seperti batu bara, kokas, minyak maupun gas (Yunita & Kiswandono, 2017)."
                    ) : selectedPollutant.pollutant === "PM10" ? (
                      "Sumber buatan manusia terdiri dari industri, pembangkit listrik, pertambangan, konstruksi, dan kendaraan bermotor. Menurut Fan & Lin bahwa partikel kasar sebagian besar berasal dari proses mekanis, seperti bioaerosol, proses mekanis di industri dan agrikultur atau debu di permukaan jalan yang tersuspensi ke udara (Fan & Lin, 2011). "
                    ) : selectedPollutant.pollutant === "PM2.5" ? (
                      "Polutan ini umumnya berasal dari pembentukan sekunder dari proses kimiawi atmosfer dan emisi langsung dari proses pembakaran sehingga mengandung lebih banyak spesies organik daripada PM10 (Fan & Lin, 2011)."
                    ) : (
                      "Tidak ada polutan yang terdefinisi"
                    )}
                  </p>

                  <p className="mb-1">
                    <strong>
                      Bagaimana {selectedPollutant.pollutant} mempengaruhi
                      kesehatan kita?{" "}
                    </strong>
                  </p>
                  <p>
                    {" "}
                    {selectedPollutant.pollutant === "CO" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Sakit kepala, pusing, dan mual</li>
                          <li>Kesulitan bernafas dan kelelahan</li>
                          <li>
                            Kebingungan dan gangguan kognitif dan detak jantung
                            cepat
                          </li>
                          <li>Gejala mirip flu </li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Kerusakan pada jantung dan otak</li>
                          <li>Gangguan pernapasan kronis</li>
                          <li>Peningkatan risiko kanker </li>
                          <li>Efek pada sistem saraf </li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "HC" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Sakit kepala, pusing, dan mual</li>
                          <li>Sering kelelahan</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Kerusakan pada paru-paru</li>
                          <li>Peningkatan risiko kanker </li>
                          <li>Efek pada sistem saraf </li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "NO2" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Gejala flu</li>
                          <li>Gangguan fungsi paru-paru</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Penyakit paru-paru kronis</li>
                          <li>Perburukan asma</li>
                          <li>Penurunan fungsi paru</li>
                          <li>Peningkatan risiko kanker paru</li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "O3" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Penurunan kapasitas paru-paru</li>
                          <li>Kelelahan dan sesak napas</li>
                          <li>Iritasi mata</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Penyakit paru-paru kronis</li>
                          <li>Asma</li>
                          <li>Penurunan fungsi paru</li>
                          <li>Peningkatan risiko kanker paru</li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "SO2" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Meningkatkan gejala asma</li>
                          <li>Kelelahan dan sesak napas</li>
                          <li>Iritasi mata</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Penyakit paru-paru kronis</li>
                          <li>Peningkatan risiko infeksi saluran pernapasan</li>
                          <li>Penurunan fungsi paru</li>
                          <li>Penyebab penyakit kardiovaskular</li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "PM10" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Meningkatkan gejala asma</li>
                          <li>Kelelahan dan sesak napas</li>
                          <li>Iritasi mata</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Penyakit paru-paru kronis</li>
                          <li>Peningkatan risiko infeksi saluran pernapasan</li>
                          <li>Penurunan fungsi paru</li>
                          <li>Penyebab penyakit kardiovaskular</li>
                        </ul>
                      </>
                    ) : selectedPollutant.pollutant === "PM25" ? (
                      <>
                        <strong>Efek jangka pendek:</strong>
                        <ul>
                          <li>Iritasi pada saluran pernapasan</li>
                          <li>Meningkatkan gejala alergi</li>
                          <li>Kelelahan dan sesak napas</li>
                          <li>Peningkatan risiko serangan asma</li>
                        </ul>
                        <strong>Efek jangka panjang:</strong>
                        <ul>
                          <li>Penyakit paru-paru kronis</li>
                          <li>Penyakit jantung</li>
                          <li>Kanker paru-paru</li>
                          <li>Gangguan perkembangan pada anak</li>
                          <li>Peningkatan risiko stroke</li>
                          <li>Efek pada sistem saraf</li>
                        </ul>
                      </>
                    ) : (
                      "Tidak ada polutan yang terdefinisi"
                    )}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={handleCloseModal}>
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* End of Modal Card 1 */}
      </div>
    </section>
  );
};

export default TodayCard;
