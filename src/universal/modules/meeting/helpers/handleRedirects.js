import {
  AGENDA_ITEMS,
  SUMMARY,
} from 'universal/utils/constants';
import makePushURL from './makePushURL';
import actionMeeting from 'universal/modules/meeting/helpers/actionMeeting';

export default function handleRedirects(oldProps, nextProps) {
  const {agenda, localPhaseItem, router, params: {localPhase}, team} = nextProps;
  const {agenda: oldAgenda = {}, team: oldTeam = {}} = oldProps;
  /* DEBUG: uncomment below */
  // console.log(`handleRedirects(${JSON.stringify(team)}, ${localPhase}, ${localPhaseItem}, ...)`);
  const {facilitatorPhase, facilitatorPhaseItem, meetingPhase, id: teamId, meetingId} = team;

  // bail out fast while we're waiting for the team sub
  if (!teamId) return false;

  // DEBUGGING
  // if no/bad phase given, goto the facilitator
  const localPhaseInfo = actionMeeting[localPhase];
  if (!localPhaseInfo) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return false;
  }

  // if the phase should be followed by a number
  if (localPhaseInfo.items) {
    const {countName, arrayName} = localPhaseInfo.items;
    const initialPhaseItemCount = nextProps[countName];
    const phaseItems = nextProps[arrayName];
    // bail out fast if the query or sub items haven't returned
    if (initialPhaseItemCount === null || initialPhaseItemCount > phaseItems.length) {
      return false;
    }

    // if it's a bad number (or not a number at all)
    if (localPhaseItem > phaseItems.length || localPhaseItem <= 0) {
      // if they're in the same phase as the facilitator, or the phase they wanna go to has no items, go to their phase item
      if (facilitatorPhase === localPhase || phaseItems.length <= 1) {
        const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
        router.replace(pushURL);
        return false;
      }
      // if they wanna go somewhere that the facilitator isn't take them to the beginning (url is 1-indexed)
      const pushURL = makePushURL(teamId, localPhase, 1);
      router.replace(pushURL);
      return false;
    }
  } else if (localPhaseItem !== undefined) {
    // if the url has a phase item that it shouldn't, remove it
    const pushURL = makePushURL(teamId, localPhase);
    router.replace(pushURL);
    return false;
  }

  // don't let anyone in the lobby, first call, or last call after they've been visited & the meeting has moved on
  const meetingPhaseInfo = actionMeeting[meetingPhase];
  if (localPhaseInfo.visitOnce === true && localPhaseInfo.index < meetingPhaseInfo.index) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return false;
  }

  // don't let anyone skip to the next phase
  if (localPhaseInfo.index > meetingPhaseInfo.index) {
    const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
    router.replace(pushURL);
    return false;
  }

  // is the facilitator making moves?
  if (facilitatorPhaseItem !== oldTeam.facilitatorPhaseItem ||
    facilitatorPhase !== oldTeam.facilitatorPhase) {
    // were we n'sync?
    const inSync = localPhase === oldTeam.facilitatorPhase &&
      (localPhaseItem === undefined || localPhaseItem === oldTeam.facilitatorPhaseItem);
    if (inSync) {
      const pushURL = makePushURL(teamId, facilitatorPhase, facilitatorPhaseItem);
      router.replace(pushURL);
      return false;
    }
  }

  // check sort order for agenda items
  if (localPhase === AGENDA_ITEMS && oldAgenda.length === agenda.length) {
    // we made sure agendaCount was loaded above
    const oldAgendaItem = oldAgenda[localPhaseItem - 1];
    const newAgendaItem = agenda[localPhaseItem - 1];
    if (!newAgendaItem || newAgendaItem.id !== oldAgendaItem.id) {
      const updatedAgendaItemIdx = agenda.findIndex((a) => a.id === oldAgendaItem.id);
      if (updatedAgendaItemIdx !== -1) {
        const pushURL = makePushURL(teamId, AGENDA_ITEMS, updatedAgendaItemIdx + 1);
        router.replace(pushURL);
        return false;
      }
    }
  }

  if (facilitatorPhase === SUMMARY) {
    router.replace(`/summary/${meetingId}`);
    return false;
  }
  return true;
}
