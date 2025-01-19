import React, { useEffect, useRef, useState } from "react";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import View from "ol/View";
import { OSM } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { LineString, Polygon } from "ol/geom";
import { getLength } from "ol/sphere";
import { useDispatch, useSelector } from "react-redux";
import { resetRowPosition, setRowPosition } from "../redux/slices/rowPositionIndex";
import {
  addTableData,
  resetTableData,
} from "../redux/slices/tableDataSlice";

const MapDrawNew = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [selectedType, setSelectedType] = useState("LineString");
  const source = useRef(new VectorSource({ wrapX: false }));
  const [showModal, setShowModal] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  const [modalData, setModalData] = useState({ title: "", coordinates: [] });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [newData, setNewData] = useState(null);

  const dispatch = useDispatch();

  const { rowPosition, rowIndex } = useSelector((state) => state.positionindex);
  const tableData = useSelector((state) => state.tableData);

  useEffect(() => {
    const rasterLayer = new TileLayer({
      source: new OSM(),
    });

    const vectorLayer = new VectorLayer({
      source: source.current,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [rasterLayer, vectorLayer],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
      }),
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(null);
    };
  }, []);

  const addInteraction = () => {
    if (selectedType !== "None" && mapInstance.current) {
      const draw = new Draw({
        source: source.current,
        type: selectedType,
      });

      setDrawInteraction(draw);
      mapInstance.current.addInteraction(draw);

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        let coordinates = [];

        if (geometry instanceof LineString) {
          coordinates = geometry.getCoordinates();
        } else if (geometry instanceof Polygon) {
          coordinates = geometry.getCoordinates()[0];
        }

        const updatedTableData = coordinates.map((coord, index) => ({
          wp: (index + 1).toString().padStart(2, "0"),
          coordinate: coord,
          distance:
            index > 0
              ? getLength(new LineString([coordinates[index - 1], coord]))
              : 0,
        }));

        setNewData(updatedTableData)
      setShowImportModal(true)

      });

      const handleKeyDown = (event) => {
        if (event.key === "Enter") {
          draw.finishDrawing();
        }
      };

      window.addEventListener("keydown", handleKeyDown);


      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    dispatch(resetTableData());
  };

  useEffect(() => {
    if (drawInteraction) {
      mapInstance.current.removeInteraction(drawInteraction);
    }

    addInteraction();

    return () => {
      if (drawInteraction) {
        mapInstance.current.removeInteraction(drawInteraction);
      }
    };
  }, [selectedType]);

  const handleInsertData = (position, index) => {
    dispatch(setRowPosition({ rowPosition: position, rowIndex: index }));
    setShowModal(false);
    setDropdownOpen(null);
  };

  const toggleDropdown = (index) => {
    setDropdownOpen((prev) => (prev === index ? null : index));
  };

  const importDataHandler=()=>{
    setShowImportModal(false)
    setShowModal(true)
    let updatedData;
    if (rowIndex != null) {
     updatedData = [...tableData];
      console.log(updatedData,rowIndex,rowPosition,'before update');
      

      if (rowPosition === "before") {
        updatedData.splice(rowIndex, 0, ...newData);
      } else if (rowPosition === "after") {
        updatedData.splice(rowIndex + 1, 0, ...newData);
      }
      
    } else {
      updatedData = [...tableData,...newData];

    }
    dispatch(resetTableData())
    updatedData?.forEach((item, index) => {
      const updatedWpValue = (index + 1).toString().padStart(2, '0');
      const updatedItem = {
        ...item,
        wp: updatedWpValue,
      };
      dispatch(addTableData(updatedItem));
    });

    dispatch(resetRowPosition())

  }

  return (
    <>
      <div className="relative h-screen overflow-hidden">
        <div
          ref={mapRef}
          className="map w-full h-full border border-gray-300"
        ></div>
        <div className="absolute top-4 left-4 space-x-4 z-50">
            <select
              id="type"
              value={selectedType}
              onChange={handleTypeChange}
              className="form-select p-2 text-md border rounded"
            >
              <option value="LineString">LineString</option>
              <option value="Polygon">Polygon</option>
            </select>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full md:w-[80%] lg:w-[75%] xl:w-[60%] p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{selectedType} Tool</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-xl hover:scale-105"
              >
                &times;
              </button>
            </div>
            <div className="mb-4">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className=" p-2">WP</th>
                    <th className=" p-2">Coordinates</th>
                    <th className="p-2">Distance (m)</th>
                  </tr>
                </thead>
                <tbody className="">
                  {newData?.map((row, index) => (
                    <tr key={index} className={`${index===0 && 'rounded-t-xl rounded'} bg-gray-100 border-b`}>
                      <td className="p-2">{row.wp}</td>
                      <td className="p-2">
                        {row?.coordinate.join(", ")}
                      </td>
                      <td className="p-2">{row?.distance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between text-emerald-50 w-full">
              <button
                onClick={() => setShowImportModal(false)}
                className="bg-red-600 text-white p-2 rounded hover:scale-105 hover:bg-gray-700"
              >
                Discard
              </button>
              <button
                onClick={importDataHandler}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-gray-700 hover:scale-105"
              >
                Import Points
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg mx-4 w-full md:w-[80%] lg:w-[75%] xl:w-[60%] py-4 max-h-[80vh] overflow-auto">
            <div className="flex w-full px-2 shadow-md shadow-gray-300 pb-2 justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Mission Creation</h3>
              <button onClick={() => setShowModal(false)} className="text-2xl mr-3 hover:scale-105">
                &times;
              </button>
            </div>
            <div className="px-4 mb-2">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="p-2">WP</th>
                    <th className="p-2">Coordinates</th>
                    <th className="p-2">Distance (m)</th>
                    {/* <th className="p-2">Action</th> */}
                  </tr>
                </thead>
                <tbody className="bg-gray-100">
                  {tableData?.map((row, index) => (
                    <tr key={index}>
                      <td className=" p-2">{row.wp}</td>
                      <td className=" p-2">
                        {row?.coordinate.join(", ")}
                      </td>
                      <td className="p-2">{row?.distance} meters</td>
                      <td className=" p-2 relative">
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="text-blue-500"
                        >
                          &#x22EE;
                        </button>
                        {dropdownOpen === index && (
                          <div className="absolute right-0 mt-2 bg-white border rounded shadow-lg w-48">
                            <button
                              onClick={() => handleInsertData("before", index)}
                              className="w-full text-left p-2 hover:bg-gray-200"
                            >
                              Insert Before
                            </button>
                            <button
                              onClick={() => handleInsertData("after", index)}
                              className="w-full text-left p-2 hover:bg-gray-200"
                            >
                              Insert After
                            </button>
                           
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-200 border rounded-lg mt-3 py-3 text-center border-dashed border-gray-500">
                Click on the map to mark points of the route and then press
                enter to complete route
              </div>
              <div className="flex w-full mt-3 pt-2 border-t-2 border-gray-400 justify-end mr-5 space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-blue-800 text-white py-1 px-4 rounded hover:bg-gray-700 hover:scale-105"
                >
                  Draw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapDrawNew;
