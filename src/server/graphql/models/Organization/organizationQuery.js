import getRethink from 'server/database/rethinkDriver';
import {GraphQLNonNull, GraphQLID, GraphQLInt} from 'graphql';
import {Organization} from './organizationSchema';
import {requireSUOrTeamMember, requireSUOrSelf} from 'server/utils/authorization';

export default {
  orgCount: {
    type: GraphQLInt,
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'the user ID that belongs to all the orgs'
      }
    },
    async resolve(source, {userId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrSelf(authToken, userId);

      // RESOLUTION
      return await r.table('Organization')
        .getAll(userId, {index: 'orgUsers'})
        .count();
    }
  },
  orgDetails: {
    type: Organization,
    args: {
      teamId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the inviting team'
      }
    },
    async resolve(source, {teamId}, {authToken}) {
      const r = getRethink();

      // AUTH
      requireSUOrTeamMember(authToken, teamId);

      // RESOLUTION
      return await r.table('Team').get(teamId)('orgId')
        .do((orgId) => {
          return r.table('Organization').get(orgId);
        });
    }
  }
};
