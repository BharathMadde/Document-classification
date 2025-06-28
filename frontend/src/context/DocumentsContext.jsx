import React, { createContext, useContext, useEffect, useState } from "react";
import { listDocuments } from "../api";

const DocumentsContext = createContext();

export function useDocuments() {
  return useContext(DocumentsContext);
}

export function DocumentsProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = () => {
      listDocuments()
        .then((response) => {
          if (response.success && Array.isArray(response.documents)) {
            setDocuments(response.documents);
          } else if (Array.isArray(response)) {
            setDocuments(response);
          } else {
            setDocuments([]);
            setError("Invalid response format from server");
          }
        })
        .catch((err) => {
          setError(err.message);
          setDocuments([]);
        });
    };
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DocumentsContext.Provider value={{ documents, setDocuments, error }}>
      {children}
    </DocumentsContext.Provider>
  );
}
