import { DEFAULT_ROOMS } from '../constants/languages';
import { IoPeople, IoChatbubbles } from 'react-icons/io5';

const Sidebar = ({ currentRoomId, onRoomChange, onlineUsers }) => {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IoChatbubbles />
          Rooms
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {DEFAULT_ROOMS.map((room) => (
          <button
            key={room.id}
            onClick={() => onRoomChange(room)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              currentRoomId === room.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="font-medium">#{room.name}</div>
            <div className="text-xs opacity-75 mt-1">{room.description}</div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <IoPeople size={18} />
          <span>{onlineUsers} users online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

