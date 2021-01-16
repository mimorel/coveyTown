import { ConnectOptions } from 'twilio-video';
import { isMobile, removeUndefineds } from '..';
import { getResolution } from '../../state/settings/renderDimensions';
import { useAppState } from '../../state';

export default function useConnectionOptions() {
  const { roomType, settings } = useAppState();

  // See: https://media.twiliocdn.com/sdk/js/video/releases/2.0.0/docs/global.html#ConnectOptions
  // for available connection options.
  const connectionOptions: ConnectOptions = {
    // Bandwidth Profile, Dominant Speaker, and Network Quality
    // features are only available in Small Group or Group Rooms.
    // Please set "Room Type" to "Group" or "Small Group" in your
    // Twilio Console: https://www.twilio.com/console/video/configure
    bandwidthProfile: {
      video: {
        mode: 'grid', //settings.bandwidthProfileMode,
        dominantSpeakerPriority: settings.dominantSpeakerPriority,
        renderDimensions: {
          low: {width: 176, height: 144}, //getResolution(settings.renderDimensionLow),
          standard: {width: 320, height: 240}, //getResolution(settings.renderDimensionStandard),
          high: {width: 1280, height: 720} //getResolution(settings.renderDimensionHigh),
        },
        maxTracks: Number(settings.maxTracks),
      },
    },
    dominantSpeaker: true,
    networkQuality: { local: 1, remote: 1 },

    // Comment this line if you are playing music.
    maxAudioBitrate: Number(settings.maxAudioBitrate),

    // VP8 simulcast enables the media server in a Small Group or Group Room
    // to adapt your encoded video quality for each RemoteParticipant based on
    // their individual bandwidth constraints. Simulcast should be disabled if
    // you are using Peer-to-Peer or 'Go' Rooms.
    preferredVideoCodecs: [{ codec: 'VP8', simulcast: roomType !== 'peer-to-peer' && roomType !== 'go' }],
  };

  // For mobile browsers, limit the maximum incoming video bitrate to 2.5 Mbps.
  if (isMobile && connectionOptions?.bandwidthProfile?.video) {
    connectionOptions!.bandwidthProfile!.video!.maxSubscriptionBitrate = 2500000;
  }
  console.log(connectionOptions)

  // Here we remove any 'undefined' values. The twilio-video SDK will only use defaults
  // when no value is passed for an option. It will throw an error when 'undefined' is passed.
  return removeUndefineds(connectionOptions);
}
