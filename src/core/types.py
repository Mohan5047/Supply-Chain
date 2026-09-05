from enum import Enum

class CustomerTier(str, Enum):
    PLATINUM = "Platinum"
    GOLD = "Gold"
    STANDARD = "Standard"

class UrgencyLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NONE = "NONE"

class DisruptionCategory(str, Enum):
    SUPPLIER_HALT = "Supplier Production Halt"
    CARRIER_DELAY = "Carrier / Logistics Delay"
    PORT_CONGESTION = "Port Congestion"
    WAREHOUSE_INCIDENT = "Warehouse Incident / Stock Loss"
    WEATHER_FORCE_MAJEURE = "Weather / Force Majeure"
    TRAFFIC_ADVISORY = "Traffic Advisory"
    UNKNOWN = "Unknown / Unclassified"

class ResolutionOptionType(str, Enum):
    EXPEDITE_AIR = "EXPEDITE_AIR"
    REALLOCATE_STOCK = "REALLOCATE_STOCK"
    PART_SHIP = "PART_SHIP"
    RESCHEDULE_INFORM = "RESCHEDULE_INFORM"
    CANCEL_ORDER = "CANCEL_ORDER"

class MatchConfidence(str, Enum):
    EXACT = "EXACT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NO_MATCH = "NO_MATCH"
    AMBIGUOUS = "AMBIGUOUS"
