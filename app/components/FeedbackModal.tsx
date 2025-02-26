"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

type FeedbackModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: { reason: string; voterName: string }) => void
  vote: "up" | "down"
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, vote }) => {
  const [reason, setReason] = useState("")
  const [voterName, setVoterName] = useState("")

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ reason, voterName })
    setReason("")
    setVoterName("")
  }

  if (!isOpen) return null

  return (
    <>
      <div className="modal-backdrop fade show" style={{ opacity: 0.5 }} onClick={onClose}></div>
      <div
        className="modal fade show"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
          overflow: "auto",
        }}
        tabIndex={-1}
      >
        <div className="modal-dialog" style={{ zIndex: 1050 }}>
          <div className="modal-content border-0">
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center">
                {vote === "down" ? (
                  <ThumbsDown className="text-danger me-3" size={24} />
                ) : (
                  <ThumbsUp className="text-success me-3" size={24} />
                )}
                <h5 className="modal-title fs-5">
                  {vote === "up"
                    ? "Merci pour votre vote positif"
                    : "Désolé que cette réponse ne vous ait pas satisfait"}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                style={{ position: "absolute", right: "1rem", top: "1rem" }}
              />
            </div>
            <div className="modal-body pt-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="feedbackReason" className="form-label fw-bold mb-3">
                    Pourquoi avez-vous donné ce vote ?
                  </label>
                  <textarea
                    className="form-control"
                    id="feedbackReason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    style={{ resize: "none" }}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label htmlFor="voterName" className="form-label fw-bold mb-3">
                    Votre nom (optionnel)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="voterName"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    backgroundColor: "#ff7900",
                    color: "white",
                    border: "none",
                    padding: "0.75rem",
                    fontSize: "1rem",
                    fontWeight: 500,
                  }}
                >
                  Envoyer le feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

