import {
    createMuiTheme,
    ThemeProvider as MuiThemeProvider,
} from '@material-ui/core/styles';
import merge from 'deepmerge';
import React, { ReactNode, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from 'react-jss';
import { Provider } from 'react-redux';
import shortid from 'shortid';

import { useChonkyStore } from '../../redux/store';
import { FileBrowserHandle, FileBrowserProps } from '../../types/file-browser.types';
import { defaultConfig } from '../../util/default-config';
import { getValueOrFallback } from '../../util/helpers';
import { useStaticValue } from '../../util/hooks-helpers';
import { ChonkyIconContext } from '../../util/icon-helper';
import {
    darkThemeOverride,
    lightTheme,
    mobileThemeOverride,
    useIsMobileBreakpoint,
} from '../../util/styles';
import { ChonkyBusinessLogic } from '../internal/ChonkyBusinessLogic';
import { ChonkyIconPlaceholder } from '../internal/ChonkyIconPlaceholder';
import { ChonkyPresentationLayer } from '../internal/ChonkyPresentationLayer';

// if (process.env.NODE_ENV === 'development') {
//     const whyDidYouRender = require('@welldone-software/why-did-you-render');
//     whyDidYouRender(React, {
//         trackAllPureComponents: true,
//     });
// }

export const FileBrowser = React.forwardRef<
    FileBrowserHandle,
    FileBrowserProps & { children?: ReactNode }
>((props, ref) => {
    const { instanceId, iconComponent, children } = props;
    const disableDragAndDrop = getValueOrFallback(
        props.disableDragAndDrop,
        defaultConfig.disableDragAndDrop,
        'boolean'
    );
    const disableDragAndDropProvider = getValueOrFallback(
        props.disableDragAndDropProvider,
        defaultConfig.disableDragAndDropProvider,
        'boolean'
    );
    const darkMode = getValueOrFallback(
        props.darkMode,
        defaultConfig.darkMode,
        'boolean'
    );

    const chonkyInstanceId = useStaticValue(() => instanceId ?? shortid.generate());
    const store = useChonkyStore(chonkyInstanceId);

    const isMobileBreakpoint = useIsMobileBreakpoint();
    const theme = useMemo(() => {
        const muiTheme = createMuiTheme({
            palette: { type: darkMode ? 'dark' : 'light' },
        });
        const combinedTheme = merge(
            muiTheme,
            merge(lightTheme, darkMode ? darkThemeOverride : {})
        );
        return isMobileBreakpoint
            ? merge(combinedTheme, mobileThemeOverride)
            : combinedTheme;
    }, [darkMode, isMobileBreakpoint]);

    const chonkyComps = (
        <>
            <ChonkyBusinessLogic ref={ref} {...props} />
            <ChonkyPresentationLayer>{children}</ChonkyPresentationLayer>
        </>
    );

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MuiThemeProvider theme={theme}>
                    <ChonkyIconContext.Provider
                        value={
                            iconComponent ??
                            defaultConfig.iconComponent ??
                            ChonkyIconPlaceholder
                        }
                    >
                        {disableDragAndDrop || disableDragAndDropProvider ? (
                            chonkyComps
                        ) : (
                            <DndProvider backend={HTML5Backend}>
                                {chonkyComps}
                            </DndProvider>
                        )}
                    </ChonkyIconContext.Provider>
                </MuiThemeProvider>
            </ThemeProvider>
        </Provider>
    );
});
FileBrowser.displayName = 'FileBrowser';
