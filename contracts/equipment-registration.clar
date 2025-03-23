;; Equipment Registration Contract
;; Records details of donated medical devices

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u403))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-EXISTS (err u409))

;; Data structures
(define-map equipment
  { equipment-id: uint }
  {
    donor: principal,
    name: (string-ascii 100),
    description: (string-ascii 500),
    specifications: (string-ascii 500),
    condition: (string-ascii 100),
    estimated-value: uint,
    maintenance-requirements: (string-ascii 500),
    training-required: bool,
    donation-date: uint,
    status: (string-ascii 20) ;; "available", "allocated", "delivered"
  }
)

(define-data-var last-equipment-id uint u0)

;; Public functions
(define-public (register-equipment
                (name (string-ascii 100))
                (description (string-ascii 500))
                (specifications (string-ascii 500))
                (condition (string-ascii 100))
                (estimated-value uint)
                (maintenance-requirements (string-ascii 500))
                (training-required bool))
  (let ((new-id (+ (var-get last-equipment-id) u1)))
    (var-set last-equipment-id new-id)
    (map-set equipment
      { equipment-id: new-id }
      {
        donor: tx-sender,
        name: name,
        description: description,
        specifications: specifications,
        condition: condition,
        estimated-value: estimated-value,
        maintenance-requirements: maintenance-requirements,
        training-required: training-required,
        donation-date: block-height,
        status: "available"
      }
    )
    (ok new-id)
  )
)

(define-public (update-equipment-status
                (equipment-id uint)
                (new-status (string-ascii 20)))
  (match (map-get? equipment { equipment-id: equipment-id })
    equipment-data
      (if (is-eq tx-sender (get donor equipment-data))
        (begin
          (map-set equipment
            { equipment-id: equipment-id }
            (merge equipment-data { status: new-status })
          )
          (ok equipment-id)
        )
        ERR-NOT-AUTHORIZED
      )
    ERR-NOT-FOUND
  )
)

(define-public (update-equipment-details
                (equipment-id uint)
                (description (string-ascii 500))
                (specifications (string-ascii 500))
                (condition (string-ascii 100))
                (estimated-value uint)
                (maintenance-requirements (string-ascii 500))
                (training-required bool))
  (match (map-get? equipment { equipment-id: equipment-id })
    equipment-data
      (if (is-eq tx-sender (get donor equipment-data))
        (begin
          (map-set equipment
            { equipment-id: equipment-id }
            (merge equipment-data {
              description: description,
              specifications: specifications,
              condition: condition,
              estimated-value: estimated-value,
              maintenance-requirements: maintenance-requirements,
              training-required: training-required
            })
          )
          (ok equipment-id)
        )
        ERR-NOT-AUTHORIZED
      )
    ERR-NOT-FOUND
  )
)

;; Read-only functions
(define-read-only (get-equipment (equipment-id uint))
  (map-get? equipment { equipment-id: equipment-id })
)

(define-read-only (get-last-equipment-id)
  (var-get last-equipment-id)
)
