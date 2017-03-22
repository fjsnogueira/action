import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import MeetingAgendaLastCall from 'universal/modules/meeting/components/MeetingAgendaLastCall/MeetingAgendaLastCall';
import getFacilitatorName from 'universal/modules/meeting/helpers/getFacilitatorName';

const getCount = (agenda, field) => agenda.map((a) => a[field].length).reduce((sum, val) => sum + val, 0);
const countOutcomes = (agenda) => {
  if (agenda !== countOutcomes.agenda) {
    countOutcomes.agenda = agenda;
    countOutcomes.actionCount = getCount(agenda, 'actions');
    countOutcomes.projectCount = getCount(agenda, 'projects');
  }
  const {actionCount, projectCount} = countOutcomes;
  return {actionCount, projectCount};
};

const meetingAgendaLastCallQuery = `
query {
  agenda(teamId: $teamId) @live {
    id
    content
    isComplete
    actions @cached(type: "[Action]") {
      id
    }
    projects @cached(type: "[Project]") {
      id
    }
  }
}`;

const mapStateToProps = (state, props) => {
  const {team: {id: teamId}} = props;
  const {agenda} = cashay.query(meetingAgendaLastCallQuery, {
    op: 'meetingAgendaLastCallContainer',
    key: teamId,
    variables: {teamId},
    resolveCached: {
      actions: (source) => (doc) => doc.agendaId === source.id,
      projects: (source) => (doc) => doc.agendaId === source.id
    },
    filter: {
      agenda: (doc) => doc.isComplete === true
    }
  }).data;
  return {
    ...countOutcomes(agenda),
    agendaItemCount: agenda.length,
  };
};

const MeetingAgendaLastCallContainer = (props) => {
  const {
    agendaItemCount,
    actionCount,
    gotoNext,
    hideMoveMeetingControls,
    members,
    projectCount,
    team
  } = props;
  return (
    <MeetingAgendaLastCall
      agendaItemCount={agendaItemCount}
      actionCount={actionCount}
      gotoNext={gotoNext}
      facilitatorName={getFacilitatorName(team, members)}
      hideMoveMeetingControls={hideMoveMeetingControls}
      projectCount={projectCount}
    />
  );
};

MeetingAgendaLastCallContainer.propTypes = {
  agendaItemCount: PropTypes.number,
  actionCount: PropTypes.number,
  gotoNext: PropTypes.func,
  isFacilitating: PropTypes.bool,
  members: PropTypes.array,
  projectCount: PropTypes.number,
  team: PropTypes.object,
  hideMoveMeetingControls: PropTypes.bool
};

export default connect(mapStateToProps)(MeetingAgendaLastCallContainer);
