import { ClassicSpinner } from "react-spinners-kit";
import styled from "styled-components";
import { Colors } from "~utils/styles";

interface ISpinnerProps {
	size?: number;
	color?: string;
}

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;
`;

export function Spinner({ size = 20, color = Colors.light }: ISpinnerProps) {
	return (
		<SpinnerContainer>
			<ClassicSpinner size={size} color={color} />
		</SpinnerContainer>
	);
}
