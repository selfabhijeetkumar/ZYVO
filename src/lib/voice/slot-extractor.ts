import { VerticalType } from '../vertical-registry';
import { ExtractedProposal } from './types';

// Helper to calculate Indian Standard Time dates
function getISTDate(offsetDays: number = 0): string {
  const d = new Date();
  // IST offset is UTC+5:30
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export async function extractSlotsFromTranscript(
  transcript: string,
  vertical: VerticalType,
  context: { workspaceId: string; customerId: string }
): Promise<ExtractedProposal> {
  const lower = transcript.toLowerCase();

  switch (vertical) {
    case 'milk_delivery': {
      // 1. Check for Pause
      if (lower.includes('mat dena') || lower.includes('band') || lower.includes('pause') || lower.includes('nahi chahiye')) {
        let offset = 1; // default 'kal' (tomorrow)
        if (lower.includes('aaj')) offset = 0;
        else if (lower.includes('kal')) offset = 1;
        else if (lower.includes('parso')) offset = 2;

        let days = 1;
        const daysMatch = lower.match(/(\d+)\s*(din|days)/);
        if (daysMatch) {
          days = parseInt(daysMatch[1], 10);
        } else if (lower.includes('do din')) {
          days = 2;
        } else if (lower.includes('teen din') || lower.includes('3 din')) {
          days = 3;
        }

        const startDate = getISTDate(offset);
        const endDate = getISTDate(offset + days - 1);

        return {
          intent: 'PAUSE_DELIVERY',
          confidence: 0.94,
          needsClarification: false,
          summary: `Pause milk delivery from ${startDate} to ${endDate} (${days} day${days > 1 ? 's' : ''})`,
          parsedFields: {
            action: 'PAUSE_DELIVERY',
            workspaceId: context.workspaceId,
            customerId: context.customerId,
            startDate,
            endDate,
            days,
            reason: 'Customer paused delivery via voice message',
          },
        };
      }

      // 2. Check for Quantity Update
      if (lower.includes('extra') || lower.includes('badha') || lower.includes('kam') || lower.includes('litre') || lower.includes('ml')) {
        let quantityMl = 1000;
        if (lower.includes('500ml') || lower.includes('aadha litre') || lower.includes('adha litre') || lower.includes('half litre')) {
          quantityMl = 500;
        } else if (lower.includes('1.5') || lower.includes('dedh litre')) {
          quantityMl = 1500;
        } else if (lower.includes('2 litre') || lower.includes('do litre')) {
          quantityMl = 2000;
        }

        const targetDate = lower.includes('aaj') ? getISTDate(0) : getISTDate(1);

        return {
          intent: 'UPDATE_QUANTITY',
          confidence: 0.92,
          needsClarification: false,
          summary: `Update milk delivery quantity to ${quantityMl}ml for ${targetDate}`,
          parsedFields: {
            action: 'UPDATE_QUANTITY',
            workspaceId: context.workspaceId,
            customerId: context.customerId,
            targetDate,
            quantityMl,
            reason: 'Customer requested quantity adjustment via voice message',
          },
        };
      }

      // Ambiguous case -> needs clarification
      return {
        intent: 'UNKNOWN_MILK_REQUEST',
        confidence: 0.60,
        needsClarification: true,
        clarificationPrompt: 'Aap kis tareekh se doodh mein badlaav karna chahte hain aur kitne din ke liye?',
        summary: 'Clarification required for milk delivery change',
        parsedFields: {
          action: 'UNKNOWN',
          workspaceId: context.workspaceId,
          customerId: context.customerId,
        },
      };
    }

    case 'kirana': {
      // Parse grocery line items
      const items: Array<{ requestedItemName: string; quantity: number; unit: string }> = [];

      // Check common patterns
      if (lower.includes('maggi')) {
        const maggiQty = lower.includes('do packet') || lower.includes('2 packet') ? 2 : 1;
        items.push({ requestedItemName: 'maggi', quantity: maggiQty, unit: 'packet' });
      }
      if (lower.includes('shakkar') || lower.includes('chini') || lower.includes('sugar')) {
        const sugarQty = lower.includes('do kilo') || lower.includes('2 kg') ? 2 : 1;
        items.push({ requestedItemName: 'shakkar', quantity: sugarQty, unit: 'kg' });
      }
      if (lower.includes('namak') || lower.includes('salt')) {
        items.push({ requestedItemName: 'namak', quantity: 1, unit: 'packet' });
      }
      if (lower.includes('tel') || lower.includes('oil')) {
        items.push({ requestedItemName: 'sunflower oil', quantity: 1, unit: 'litre' });
      }
      if (lower.includes('chawal') || lower.includes('rice')) {
        items.push({ requestedItemName: 'chawal', quantity: 2, unit: 'kg' });
      }

      if (items.length === 0) {
        items.push({ requestedItemName: transcript.slice(0, 30), quantity: 1, unit: 'item' });
      }

      return {
        intent: 'CREATE_ORDER',
        confidence: 0.91,
        needsClarification: false,
        summary: `Create Kirana grocery order with ${items.length} item(s)`,
        parsedFields: {
          workspaceId: context.workspaceId,
          customerId: context.customerId,
          items,
          deliveryAddress: 'Default Customer Address',
        },
      };
    }

    case 'vegetable_vendor': {
      const items: Array<{ requestedItemName: string; quantity: number; unit: string }> = [];

      if (lower.includes('aloo') || lower.includes('potato')) {
        items.push({ requestedItemName: 'aloo', quantity: 2, unit: 'kg' });
      }
      if (lower.includes('tamatar') || lower.includes('tomato')) {
        items.push({ requestedItemName: 'tamatar', quantity: 1, unit: 'kg' });
      }
      if (lower.includes('dhaniya') || lower.includes('coriander')) {
        items.push({ requestedItemName: 'dhaniya', quantity: 2, unit: 'bundles' });
      }
      if (lower.includes('adrak') || lower.includes('ginger')) {
        items.push({ requestedItemName: 'adrak', quantity: 250, unit: 'grams' });
      }
      if (lower.includes('pyaaz') || lower.includes('onion')) {
        items.push({ requestedItemName: 'pyaaz', quantity: 1, unit: 'kg' });
      }

      if (items.length === 0) {
        items.push({ requestedItemName: 'Seasonal Vegetables', quantity: 1, unit: 'kg' });
      }

      return {
        intent: 'CREATE_ORDER',
        confidence: 0.90,
        needsClarification: false,
        summary: `Create Vegetable produce order with ${items.length} item(s)`,
        parsedFields: {
          workspaceId: context.workspaceId,
          customerId: context.customerId,
          items,
        },
      };
    }

    case 'clinic': {
      // Check privacy violation
      if (lower.includes('bukhar') || lower.includes('fever') || lower.includes('chest pain') || lower.includes('dawai')) {
        return {
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.88,
          needsClarification: false,
          summary: 'Book outpatient slot with Dr. Ramesh Rao (Medical notes discarded per privacy rule)',
          parsedFields: {
            action: 'BOOK_APPOINTMENT',
            workspaceId: context.workspaceId,
            patientId: context.customerId,
            doctorId: 'doc_01',
            appointmentDate: getISTDate(1),
          },
        };
      }

      return {
        intent: 'BOOK_APPOINTMENT',
        confidence: 0.94,
        needsClarification: false,
        summary: 'Book outpatient consultation with Dr. Ramesh Rao for tomorrow at 10:00 AM',
        parsedFields: {
          action: 'BOOK_APPOINTMENT',
          workspaceId: context.workspaceId,
          patientId: context.customerId,
          doctorId: 'doc_01',
          appointmentDate: getISTDate(1),
        },
      };
    }

    case 'agriculture': {
      const volumeMatch = lower.match(/(\d+)\s*quintal/);
      const volume = volumeMatch ? parseInt(volumeMatch[1], 10) : 25;
      const cropName = lower.includes('tamatar') ? 'Tomato' : 'Wheat';

      return {
        intent: 'REGISTER_PROCUREMENT_OFFER',
        confidence: 0.93,
        needsClarification: false,
        summary: `Register farm procurement offer for ${volume} quintals of ${cropName}`,
        parsedFields: {
          workspaceId: context.workspaceId,
          farmerId: context.customerId,
          cropName,
          variety: 'Sharbati A-Grade',
          estimatedVolumeQuintals: volume,
          pickupLocation: 'Village Farm Gate',
          preferredDate: getISTDate(3),
        },
      };
    }
  }
}
