import { describe, it, expect, beforeEach } from "vitest"

// Mock implementation for testing Clarity contracts
const mockPrincipal = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
const mockBlockHeight = 100

// Mock state
let lastEquipmentId = 0
const equipment = new Map()

// Mock contract functions
const registerEquipment = (
    name,
    description,
    specifications,
    condition,
    estimatedValue,
    maintenanceRequirements,
    trainingRequired
) => {
  const newId = lastEquipmentId + 1
  lastEquipmentId = newId
  
  equipment.set(newId, {
    donor: mockPrincipal,
    name,
    description,
    specifications,
    condition,
    "estimated-value": estimatedValue,
    "maintenance-requirements": maintenanceRequirements,
    "training-required": trainingRequired,
    "donation-date": mockBlockHeight,
    status: "available"
  })
  
  return { value: newId }
}

const updateEquipmentStatus = (
    equipmentId,
    newStatus
) => {
  const equipmentData = equipment.get(equipmentId)
  if (!equipmentData) return { error: 404 }
  if (equipmentData.donor !== mockPrincipal) return { error: 403 }
  
  equipment.set(equipmentId, {
    ...equipmentData,
    status: newStatus
  })
  
  return { value: equipmentId }
}

const updateEquipmentDetails = (
    equipmentId,
    description,
    specifications,
    condition,
    estimatedValue,
    maintenanceRequirements,
    trainingRequired
) => {
  const equipmentData = equipment.get(equipmentId)
  if (!equipmentData) return { error: 404 }
  if (equipmentData.donor !== mockPrincipal) return { error: 403 }
  
  equipment.set(equipmentId, {
    ...equipmentData,
    description,
    specifications,
    condition,
    "estimated-value": estimatedValue,
    "maintenance-requirements": maintenanceRequirements,
    "training-required": trainingRequired
  })
  
  return { value: equipmentId }
}

const getEquipment = (equipmentId) => {
  const equipmentData = equipment.get(equipmentId)
  return equipmentData ? equipmentData : null
}

describe("Equipment Registration Contract", () => {
  beforeEach(() => {
    // Reset state before each test
    lastEquipmentId = 0
    equipment.clear()
  })
  
  it("should register new medical equipment", () => {
    const result = registerEquipment(
        "MRI Scanner",
        "High-resolution magnetic resonance imaging scanner",
        "3 Tesla field strength, whole-body scanner, advanced imaging capabilities",
        "Excellent - less than 2 years old",
        50000,
        "Requires annual calibration and quarterly maintenance checks",
        true
    )
    
    expect(result.value).toBe(1)
    expect(equipment.size).toBe(1)
    
    const equipmentData = getEquipment(1)
    expect(equipmentData).not.toBeNull()
    expect(equipmentData.name).toBe("MRI Scanner")
    expect(equipmentData.specifications).toBe("3 Tesla field strength, whole-body scanner, advanced imaging capabilities")
    expect(equipmentData.condition).toBe("Excellent - less than 2 years old")
    expect(equipmentData["estimated-value"]).toBe(50000)
    expect(equipmentData["training-required"]).toBe(true)
    expect(equipmentData.status).toBe("available")
  })
  
  it("should update equipment status", () => {
    // First register equipment
    registerEquipment(
        "MRI Scanner",
        "High-resolution magnetic resonance imaging scanner",
        "3 Tesla field strength, whole-body scanner, advanced imaging capabilities",
        "Excellent - less than 2 years old",
        50000,
        "Requires annual calibration and quarterly maintenance checks",
        true
    )
    
    // Then update its status
    const updateResult = updateEquipmentStatus(1, "allocated")
    expect(updateResult.value).toBe(1)
    
    const equipmentData = getEquipment(1)
    expect(equipmentData.status).toBe("allocated")
  })
  
  it("should update equipment details", () => {
    // First register equipment
    registerEquipment(
        "MRI Scanner",
        "High-resolution magnetic resonance imaging scanner",
        "3 Tesla field strength, whole-body scanner, advanced imaging capabilities",
        "Excellent - less than 2 years old",
        50000,
        "Requires annual calibration and quarterly maintenance checks",
        true
    )
    
    // Then update its details
    const updateResult = updateEquipmentDetails(
        1,
        "High-resolution magnetic resonance imaging scanner with advanced software",
        "3 Tesla field strength, whole-body scanner, advanced imaging capabilities, latest software version",
        "Excellent - fully refurbished",
        55000,
        "Requires annual calibration, quarterly maintenance checks, and software updates",
        true
    )
    
    expect(updateResult.value).toBe(1)
    
    const equipmentData = getEquipment(1)
    expect(equipmentData.description).toBe("High-resolution magnetic resonance imaging scanner with advanced software")
    expect(equipmentData.specifications).toBe("3 Tesla field strength, whole-body scanner, advanced imaging capabilities, latest software version")
    expect(equipmentData.condition).toBe("Excellent - fully refurbished")
    expect(equipmentData["estimated-value"]).toBe(55000)
    expect(equipmentData["maintenance-requirements"]).toBe("Requires annual calibration, quarterly maintenance checks, and software updates")
  })
  
  it("should fail to update non-existent equipment", () => {
    const updateResult = updateEquipmentStatus(999, "allocated")
    expect(updateResult.error).toBe(404)
  })
  
  it("should fail to update equipment if not the donor", () => {
    // First register equipment
    registerEquipment(
        "MRI Scanner",
        "High-resolution magnetic resonance imaging scanner",
        "3 Tesla field strength, whole-body scanner, advanced imaging capabilities",
        "Excellent - less than 2 years old",
        50000,
        "Requires annual calibration and quarterly maintenance checks",
        true
    )
    
    // Modify the donor to simulate a different user
    const equipmentData = equipment.get(1)
    equipment.set(1, { ...equipmentData, donor: "ST2PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" })
    
    // Then try to update it
    const updateResult = updateEquipmentStatus(1, "allocated")
    expect(updateResult.error).toBe(403)
  })
})
