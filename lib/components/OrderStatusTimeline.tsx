import React from 'react';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface OrderStatusTimelineProps {
  currentStatus: string;
  steps: TimelineStep[];
  estimatedTime?: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  steps,
  estimatedTime
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStatus);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
        {estimatedTime && currentStepIndex < steps.length - 1 && (
          <div className="text-sm">
            <span className="text-gray-600">Est. delivery: </span>
            <span className="font-semibold text-orange-600">{estimatedTime}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      isCompleted
                        ? 'bg-green-100 text-green-600 ring-2 ring-green-200'
                        : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-300 animate-pulse' : ''}`}
                  >
                    {isCompleted && index < currentStepIndex ? '✓' : step.icon}
                  </div>
                  
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-8 -ml-px transition-colors ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="ml-4 flex-1 pb-8">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-base font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTimeline;
