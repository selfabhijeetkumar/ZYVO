import { IntentExtractorProvider, IntentExtractionResult, IntentContext } from '../types';

function parseDateOffset(lower: string, baseDate: Date): { startDate: string; endDate: string; days: number } {
  let offsetDays = 1; // default 'kal' = tomorrow
  if (lower.includes('aaj') || lower.includes('today')) {
    offsetDays = 0;
  } else if (lower.includes('parso') || lower.includes('day after tomorrow')) {
    offsetDays = 2;
  } else if (lower.includes('sunday')) {
    // calculate upcoming Sunday
    const day = baseDate.getDay();
    offsetDays = (7 - day) % 7 || 7;
  } else if (lower.includes('monday') || lower.includes('somwar')) {
    const day = baseDate.getDay();
    offsetDays = ((8 - day) % 7) || 7;
  } else if (lower.includes('friday') || lower.includes('shukrawar')) {
    const day = baseDate.getDay();
    offsetDays = ((5 - day + 7) % 7) || 7;
  }

  let durationDays = 1;
  const numDaysMatch = lower.match(/(\d+)\s*(din|days)/);
  if (numDaysMatch) {
    durationDays = parseInt(numDaysMatch[1], 10);
  } else if (lower.includes('kal aur parso') || lower.includes('do din')) {
    durationDays = 2;
  } else if (lower.includes('teen din') || lower.includes('3 din')) {
    durationDays = 3;
  }

  const start = new Date(baseDate);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + durationDays - 1);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    days: durationDays,
  };
}

export class DeterministicIntentAdapter implements IntentExtractorProvider {
  public readonly id = 'deterministic';
  public readonly name = 'Deterministic Local Pattern Extractor';

  public isConfigured(): boolean {
    return true; // Always available
  }

  public async extract(
    transcript: string,
    context: IntentContext
  ): Promise<IntentExtractionResult> {
    const lower = transcript.toLowerCase().trim();
    const baseDate = context.referenceNow ? new Date(context.referenceNow) : new Date();

    switch (context.verticalType) {
      case 'milk_delivery': {
        // 1. Resume
        if (lower.includes('resume') || lower.includes('phir start') || lower.includes('chalu kar') || lower.includes('wapas shuru')) {
          const { startDate } = parseDateOffset(lower, baseDate);
          return {
            intent: 'RESUME_DELIVERY',
            confidence: 0.95,
            needsClarification: false,
            summary: `Resume regular milk delivery starting ${startDate}`,
            parsedFields: {
              action: 'RESUME_DELIVERY',
              workspaceId: context.workspaceId,
              customerId: context.customerId,
              startDate,
              reason: 'Customer requested resume via voice',
            },
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        // 2. Change Permanent Base Quantity
        if (lower.includes('roz ka') || lower.includes('daily quantity') || lower.includes('har din')) {
          let quantityMl = 1000;
          if (lower.includes('aadha litre') || lower.includes('500ml') || lower.includes('half litre')) {
            quantityMl = 500;
          } else if (lower.includes('2 litre') || lower.includes('do litre')) {
            quantityMl = 2000;
          } else if (lower.includes('1.5') || lower.includes('dedh litre')) {
            quantityMl = 1500;
          }

          return {
            intent: 'CHANGE_QUANTITY',
            confidence: 0.94,
            needsClarification: false,
            summary: `Permanently change daily subscription to ${quantityMl}ml`,
            parsedFields: {
              action: 'CHANGE_QUANTITY',
              workspaceId: context.workspaceId,
              customerId: context.customerId,
              quantityMl,
              isPermanent: true,
            },
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        // 3. Extra Milk
        if (lower.includes('extra') || lower.includes('badha') || lower.includes('zyada')) {
          let extraMl = 500;
          if (lower.includes('1 litre') || lower.includes('ek litre') || lower.includes('1000ml')) {
            extraMl = 1000;
          } else if (lower.includes('250ml') || lower.includes('ek paav')) {
            extraMl = 250;
          }
          const { startDate } = parseDateOffset(lower, baseDate);

          return {
            intent: 'ADD_EXTRA_DELIVERY',
            confidence: 0.96,
            needsClarification: false,
            summary: `Add ${extraMl}ml extra milk for ${startDate}`,
            parsedFields: {
              action: 'ADD_EXTRA_DELIVERY',
              workspaceId: context.workspaceId,
              customerId: context.customerId,
              targetDate: startDate,
              extraMl,
              isTemporary: true,
            },
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        // 4. Skip / Pause Delivery
        if (lower.includes('mat dena') || lower.includes('band') || lower.includes('skip') || lower.includes('pause') || lower.includes('nahi chahiye')) {
          const { startDate, endDate, days } = parseDateOffset(lower, baseDate);
          return {
            intent: 'PAUSE_DELIVERY',
            confidence: 0.95,
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
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        // Ambiguous milk request
        return {
          intent: 'UNKNOWN_MILK_REQUEST',
          confidence: 0.55,
          needsClarification: true,
          clarificationPrompt: 'Aap kis tareekh se doodh mein badlaav karna chahte hain aur kitne din ke liye?',
          summary: 'Clarification required for milk delivery change',
          parsedFields: { action: 'UNKNOWN', workspaceId: context.workspaceId, customerId: context.customerId },
          provider: 'deterministic',
          isDeterministicFallback: true,
        };
      }

      case 'kirana': {
        const items: Array<{ requestedItemName: string; quantity: number; unit: string }> = [];

        if (lower.includes('maggi')) {
          const qty = lower.includes('do packet') || lower.includes('2 packet') || lower.includes('2x') ? 2 : 1;
          items.push({ requestedItemName: 'maggi', quantity: qty, unit: 'packet' });
        }
        if (lower.includes('chawal') || lower.includes('rice') || lower.includes('basmati')) {
          const qty = lower.includes('do kilo') || lower.includes('2 kg') ? 2 : 1;
          items.push({ requestedItemName: 'chawal', quantity: qty, unit: 'kg' });
        }
        if (lower.includes('shakkar') || lower.includes('chini') || lower.includes('sugar')) {
          let qty = 1;
          if (lower.includes('aadha kilo') || lower.includes('500g') || lower.includes('half kg')) {
            qty = 0.5;
          } else if (lower.includes('do kilo') || lower.includes('2 kg')) {
            qty = 2;
          }
          items.push({ requestedItemName: 'shakkar', quantity: qty, unit: 'kg' });
        }
        if (lower.includes('namak') || lower.includes('salt')) {
          items.push({ requestedItemName: 'namak', quantity: 1, unit: 'packet' });
        }
        if (lower.includes('tel') || lower.includes('oil')) {
          items.push({ requestedItemName: 'sunflower oil', quantity: 1, unit: 'litre' });
        }

        if (items.length === 0) {
          return {
            intent: 'UNKNOWN_KIRANA_ORDER',
            confidence: 0.5,
            needsClarification: true,
            clarificationPrompt: 'Aapko kounsi grocery items chahiye aur kitni quantity mein?',
            summary: 'Clarification required for grocery items',
            parsedFields: { workspaceId: context.workspaceId, customerId: context.customerId },
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        return {
          intent: 'CREATE_GROCERY_ORDER',
          confidence: 0.93,
          needsClarification: false,
          summary: `Create Kirana grocery order with ${items.length} item(s)`,
          parsedFields: {
            workspaceId: context.workspaceId,
            customerId: context.customerId,
            items,
            deliveryAddress: 'Default Customer Address',
          },
          provider: 'deterministic',
          isDeterministicFallback: true,
        };
      }

      case 'vegetable_vendor': {
        const items: Array<{ requestedItemName: string; quantity: number; unit: string }> = [];

        if (lower.includes('aloo') || lower.includes('batata') || lower.includes('potato')) {
          const qty = lower.includes('do kilo') || lower.includes('2 kg') ? 2 : 1;
          items.push({ requestedItemName: 'aloo', quantity: qty, unit: 'kg' });
        }
        if (lower.includes('tamatar') || lower.includes('tomato')) {
          let qty = 1;
          if (lower.includes('aadha kilo') || lower.includes('half kg') || lower.includes('500g')) {
            qty = 0.5;
          } else if (lower.includes('do kilo') || lower.includes('2 kg')) {
            qty = 2;
          }
          items.push({ requestedItemName: 'tamatar', quantity: qty, unit: 'kg' });
        }
        if (lower.includes('dhaniya') || lower.includes('coriander')) {
          const qty = lower.includes('do gaddi') || lower.includes('2 bundles') || lower.includes('2 gaddi') ? 2 : 1;
          items.push({ requestedItemName: 'dhaniya', quantity: qty, unit: 'bundles' });
        }
        if (lower.includes('adrak') || lower.includes('ginger')) {
          items.push({ requestedItemName: 'adrak', quantity: 250, unit: 'grams' });
        }
        if (lower.includes('pyaaz') || lower.includes('kanda') || lower.includes('onion')) {
          items.push({ requestedItemName: 'pyaaz', quantity: 1, unit: 'kg' });
        }

        if (items.length === 0) {
          return {
            intent: 'UNKNOWN_PRODUCE_ORDER',
            confidence: 0.5,
            needsClarification: true,
            clarificationPrompt: 'Aapko kounsi sabziyan aur kitni quantity (kg/grams/gaddi) chahiye?',
            summary: 'Clarification required for vegetable produce',
            parsedFields: { workspaceId: context.workspaceId, customerId: context.customerId },
            provider: 'deterministic',
            isDeterministicFallback: true,
          };
        }

        return {
          intent: 'CREATE_PRODUCE_ORDER',
          confidence: 0.94,
          needsClarification: false,
          summary: `Create Vegetable produce order with ${items.length} item(s)`,
          parsedFields: {
            workspaceId: context.workspaceId,
            customerId: context.customerId,
            items,
          },
          provider: 'deterministic',
          isDeterministicFallback: true,
        };
      }

      case 'clinic': {
        const { startDate } = parseDateOffset(lower, baseDate);
        let timeSlot = '10:00:00';
        if (lower.includes('11 baje') || lower.includes('11:00')) timeSlot = '11:00:00';
        else if (lower.includes('12 baje') || lower.includes('12:00')) timeSlot = '12:00:00';
        else if (lower.includes('shaam') || lower.includes('evening') || lower.includes('4 baje')) timeSlot = '16:00:00';

        let doctorId = 'doc_01'; // Dr. Ramesh Rao (General Medicine)
        if (lower.includes('sneha') || lower.includes('baccho') || lower.includes('child')) {
          doctorId = 'doc_02'; // Dr. Sneha Verma (Pediatrics)
        }

        return {
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.95,
          needsClarification: false,
          summary: `Book outpatient appointment with ${doctorId === 'doc_01' ? 'Dr. Ramesh Rao' : 'Dr. Sneha Verma'} on ${startDate} at ${timeSlot.slice(0, 5)}`,
          parsedFields: {
            action: 'BOOK_APPOINTMENT',
            workspaceId: context.workspaceId,
            patientId: context.customerId,
            doctorId,
            appointmentDate: startDate,
            timeSlot,
          },
          provider: 'deterministic',
          isDeterministicFallback: true,
        };
      }

      case 'agriculture': {
        const volumeMatch = lower.match(/(\d+)\s*quintal/);
        const volume = volumeMatch ? parseInt(volumeMatch[1], 10) : 50;
        const cropName = lower.includes('gehun') || lower.includes('wheat') ? 'Wheat' : 'Tomato';
        const { startDate } = parseDateOffset(lower, baseDate);

        return {
          intent: 'CREATE_PROCUREMENT_REQUEST',
          confidence: 0.94,
          needsClarification: false,
          summary: `Register farm procurement offer for ${volume} quintals of ${cropName} for pickup on ${startDate}`,
          parsedFields: {
            action: 'CREATE_PROCUREMENT_REQUEST',
            workspaceId: context.workspaceId,
            farmerId: context.customerId,
            cropName,
            variety: cropName === 'Wheat' ? 'Sharbati A-Grade' : 'Hybrid Red',
            estimatedVolumeQuintals: volume,
            pickupDate: startDate,
            pickupLocation: 'Village Farm Gate',
          },
          provider: 'deterministic',
          isDeterministicFallback: true,
        };
      }
    }
  }
}
