import React from 'react';

interface TrackingInfoProps {
  orderId: string;
  status: string;
  statusMessage: string;
  orderDate: string;
  estimatedTime?: string;
  rider?: {
    name: string;
    phone: string;
    vehicleNumber?: string;
  };
  progressPercentage: number;
}

const TrackingInfo: React.FC<TrackingInfoProps> = ({
  orderId,
  status,
  statusMessage,
  orderDate,
  estimatedTime,
  rider,
  progressPercentage
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'bg-green-500';
    if (statusLower.includes('dispatch') || statusLower.includes('otw')) return 'bg-blue-500';
    if (statusLower.includes('packaging') || statusLower.includes('preparing')) return 'bg-orange-500';
    if (statusLower.includes('cancelled')) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg shadow-sm p-6 mb-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Order Progress</span>
          <span className="text-sm font-semibold text-orange-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getStatusColor(status)} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Order ID and Status */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Order ID</p>
          <p className="text-lg font-bold text-gray-900 font-mono">#{orderId.slice(-8)}</p>
        </div>
        <div className={`px-4 py-2 rounded-full ${getStatusColor(status)} bg-opacity-10 border-2 border-current`}>
          <span className={`text-sm font-semibold ${getStatusColor(status).replace('bg-', 'text-')}`}>
            {status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-orange-500">
        <p className="text-sm text-gray-800">{statusMessage}</p>
      </div>

      {/* Time Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Order Placed</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(orderDate)}</p>
        </div>
        {estimatedTime && estimatedTime !== 'Delivered' && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Estimated Arrival</p>
            <p className="text-sm font-semibold text-orange-600">{estimatedTime}</p>
          </div>
        )}
      </div>

      {/* Rider Info */}
      {rider && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg">🏍️</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Your Delivery Rider</p>
              <p className="text-sm font-semibold text-gray-900">{rider.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <a
              href={`tel:${rider.phone}`}
              className="flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Rider
            </a>
            {rider.vehicleNumber && (
              <span className="text-xs text-gray-600">
                Vehicle: <span className="font-mono font-semibold">{rider.vehicleNumber}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingInfo;
