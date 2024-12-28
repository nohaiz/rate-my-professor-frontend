import React, { useState, useEffect } from 'react';
import AuditTrailService from "../../../../services/AuditTrailService";
import { AiOutlineClose, AiOutlineDelete } from 'react-icons/ai';

const ManageAuditTrail = () => {
  const [auditTrails, setAuditTrails] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAuditTrails, setFilteredAuditTrails] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAuditTrails, setTotalAuditTrails] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAuditTrails = async () => {
      try {
        const data = await AuditTrailService.getAllAuditTrails();
        setAuditTrails(data);
        setFilteredAuditTrails(data);
        setTotalAuditTrails(data.length);
      } catch (err) {
        setError('Failed to load audit trails');
      }
    };

    fetchAuditTrails();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAuditTrails(auditTrails.slice(0, 10));
      setCurrentPage(1);
    } else {
      const filtered = auditTrails.filter((audit) => {
        return (
          audit.collectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          audit.operationType.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredAuditTrails(filtered);
      setCurrentPage(1);
    }
  }, [searchQuery, auditTrails]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredAuditTrails(auditTrails.slice(startIndex, endIndex));
  }, [currentPage, auditTrails]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleShowDetails = (audit) => {
    setSelectedAudit(audit.uniqueId === selectedAudit?.uniqueId ? null : audit);
  };

  const handleDeleteAuditTrail = async (auditTrailId) => {
    try {
      const response = await AuditTrailService.deleteAuditTrail(auditTrailId);
      if (response.error) {
        setError(`Failed to delete audit trail with ID ${auditTrailId}`);
      } else {
        setAuditTrails(auditTrails.filter((audit) => audit._id !== auditTrailId));
        setFilteredAuditTrails(filteredAuditTrails.filter((audit) => audit._id !== auditTrailId));
      }
    } catch (error) {
      setError("Failed to delete audit trail");
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(totalAuditTrails / itemsPerPage)) return;
    setCurrentPage(page);
  };

  const formatJSON = (data) => {
    if (Array.isArray(data)) {
      return data.length === 0 ? "Empty" : data.join(", ");
    }

    if (typeof data === "object" && data !== null) {
      if (data.updatedFields && Array.isArray(data.updatedFields)) {
        if (data.updatedFields.length === 0) {
          return "No fields updated";
        }
        return (
          <div>
            <strong>Updated Fields:</strong>
            <ul className="list-disc pl-5">
              {data.updatedFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        );
      }

      if (data.removedFields && data.removedFields === "Empty") {
        return "No removed fields";
      }

      if (data.truncatedArrays && data.truncatedArrays === "Empty") {
        return "No truncated arrays";
      }

      return (
        <table className="table-auto w-full text-sm mt-3">
          <tbody>
            {Object.keys(data).map((key) => {
              if (key === "updatedFields" || key === "removedFields" || key === "truncatedArrays") {
                return null;
              }
              return (
                <tr key={key}>
                  <td className="text-gray-700">{key}</td>
                  <td className="text-gray-500">
                    {typeof data[key] === "object" ? (
                      <pre className="text-gray-500">{cleanObject(data[key])}</pre>
                    ) : (
                      cleanString(data[key])
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    return data || "Empty";
  };

  const cleanString = (str) => {
    if (typeof str === "string") {
      return str
        .replace(/[\{\}\[\]\"\,\"]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    return str;
  };

  const cleanObject = (obj) => {
    if (typeof obj === "object") {
      return Object.keys(obj).map((key) => (
        <div key={key}>
          <strong>{key}: </strong>{cleanString(obj[key])}
        </div>
      ));
    }
    return cleanString(obj);
  };

  const renderFullDocument = (audit) => {
    if (audit.fullDocument) {
      return (
        <div>
          <table className="table-auto w-full text-sm">
            <tbody>
              {Object.keys(audit.fullDocument).map((key) => (
                <tr key={key}>
                  <td className="text-sm font-medium text-gray-900">{key}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div className='space-x-5'>
                      {formatJSON(audit.fullDocument[key])}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="mt-5 text-sm text-gray-500">No full document available</div>
    );
  };

  const renderUpdateDescription = (audit) => {
    if (audit.updateDescription) {
      return (
        <div>
          <h5 className="text-lg font-semibold text-gray-900 mt-5">Updated Description:</h5>
          <table className="table-auto w-full text-sm mt-3">
            <tbody>
              {Object.keys(audit.updateDescription).map((key) => (
                <tr key={key}>
                  <td className="text-sm font-medium text-gray-900">{key}</td>
                  <td className="p-4 text-sm text-gray-500">{formatJSON(audit.updateDescription[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="mt-5 text-sm text-gray-500">No update description available</div>
    );
  };

  const totalPages = Math.ceil(totalAuditTrails / itemsPerPage);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center mb-6 ml-6">
        <div className="flex flex-col space-y-2">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            Manage Audit Trails
            {error && (
              <div className="text-red-500 text-sm font-medium ml-4 flex justify-center items-center">
                {error}
              </div>
            )}
          </h3>
          <p className="text-sm text-gray-600 mt-1">Manage and view all audit trails.</p>
        </div>
        {selectedAudit ? (
          <button onClick={() => setSelectedAudit(null)} className="mr-2">
            <AiOutlineClose />
          </button>
        ) : <></>}
      </div>

      {!selectedAudit ? (
        <div className="mb-6 ml-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search audit trails..."
            className="sm:text-sm px-4 py-2 border rounded-full w-80"
          />
        </div>
      ) : <></>}

      {selectedAudit ? (
        <div className="pl-2 space-y-2 ml-4">
          <div className="mt-2 space-y-6">
            {renderFullDocument(selectedAudit)}
            {renderUpdateDescription(selectedAudit)}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto mt-5">
          <table className="w-full table-auto text-sm">
            <thead className="bg-white text-sm text-gray-700 font-thin">
              <tr>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Collection</th>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Operation</th>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Document ID</th>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Timestamp</th>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Details</th>
                <th className="px-6 py-4 text-left border-b border-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredAuditTrails.map((audit) => (
                <tr key={audit.uniqueId} className="border-b">
                  <td className="px-6 py-4 text-gray-900 font-semibold">{audit.collectionName}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">{audit.operationType}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">{audit.documentKey._id}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">
                    {new Date(audit.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleShowDetails(audit)}
                      className="text-black hover:text-gray-800 text-sm"
                    >
                      {selectedAudit?.uniqueId === audit.uniqueId ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteAuditTrail(audit._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      <AiOutlineDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && !searchQuery && !selectedAudit && (
        <div className="flex justify-center mt-8">
          <nav aria-label="Page navigation" className="inline-flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-indigo-500 text-white text-sm font-medium rounded-full py-2 px-6 hover:bg-indigo-600 disabled:bg-gray-400 text-gray-500"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {filteredAuditTrails.length === 0 && (
        <div className="text-center text-red-500 mt-5 text-sm">No audit trails available</div>
      )}
    </div>
  );
};

export default ManageAuditTrail;
